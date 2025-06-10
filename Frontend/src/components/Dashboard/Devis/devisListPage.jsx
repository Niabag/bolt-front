import { useEffect, useState } from "react";
import { API_ENDPOINTS, apiRequest } from "../../../config/api";
import "./devis.scss";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR");
  } catch (error) {
    return "";
  }
};

const calculateTTC = (devis) => {
  if (!devis || !Array.isArray(devis.articles)) return 0;
  
  return devis.articles.reduce((total, article) => {
    const price = parseFloat(article.unitPrice || 0);
    const qty = parseFloat(article.quantity || 0);
    const tva = parseFloat(article.tvaRate || 0);
    
    if (isNaN(price) || isNaN(qty) || isNaN(tva)) return total;
    
    const ht = price * qty;
    return total + ht + (ht * tva / 100);
  }, 0);
};

const DevisListPage = ({ clients = [], onEditDevis, onCreateDevis }) => {
  const [devisList, setDevisList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // États pour filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedDevis, setSelectedDevis] = useState([]);
  
  // États pour pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    fetchAllDevis();
  }, []);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Réinitialiser la sélection quand on change de page
  useEffect(() => {
    setSelectedDevis([]);
  }, [currentPage]);

  const fetchAllDevis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest(API_ENDPOINTS.DEVIS.BASE);
      const devisArray = Array.isArray(data) ? data : [];
      setDevisList(devisArray);
      
      console.log("📋 Devis récupérés:", devisArray.length);
      
    } catch (err) {
      console.error("Erreur récupération des devis:", err);
      setError("Erreur lors de la récupération des devis");
    } finally {
      setLoading(false);
    }
  };

  // Filtrer et trier les devis
  const filteredDevis = devisList
    .filter(devis => {
      const client = clients.find(c => c._id === (typeof devis.clientId === "object" ? devis.clientId?._id : devis.clientId));
      const clientName = client?.name || "Client inconnu";
      
      const matchesSearch = devis.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           devis.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'nouveau' && devis.status === 'nouveau') ||
                           (statusFilter === 'en_attente' && devis.status === 'en_attente') ||
                           (statusFilter === 'fini' && devis.status === 'fini') ||
                           (statusFilter === 'inactif' && devis.status === 'inactif');
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || "").localeCompare(b.title || "");
        case 'client':
          const clientA = clients.find(c => c._id === (typeof a.clientId === "object" ? a.clientId?._id : a.clientId))?.name || "";
          const clientB = clients.find(c => c._id === (typeof b.clientId === "object" ? b.clientId?._id : b.clientId))?.name || "";
          return clientA.localeCompare(clientB);
        case 'amount':
          return calculateTTC(b) - calculateTTC(a);
        case 'date':
        default:
          return new Date(b.dateDevis || 0) - new Date(a.dateDevis || 0);
      }
    });

  // Calculs de pagination
  const totalPages = Math.ceil(filteredDevis.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDevis = filteredDevis.slice(startIndex, endIndex);

  // Statistiques pour l'en-tête avec CA réalisé et potentiel
  const caRealise = devisList
    .filter(d => d.status === 'fini')
    .reduce((sum, d) => sum + calculateTTC(d), 0);
  
  const caPotentiel = devisList
    .filter(d => ['nouveau', 'en_attente'].includes(d.status))
    .reduce((sum, d) => sum + calculateTTC(d), 0);

  const nouveauCount = devisList.filter(d => d.status === 'nouveau').length;
  const enAttenteCount = devisList.filter(d => d.status === 'en_attente').length;
  const finiCount = devisList.filter(d => d.status === 'fini').length;
  const inactifCount = devisList.filter(d => d.status === 'inactif').length;

  const handleDelete = async (id) => {
    const confirm = window.confirm("❗ Supprimer ce devis ?");
    if (!confirm) return;

    setLoading(true);
    try {
      await apiRequest(API_ENDPOINTS.DEVIS.DELETE(id), {
        method: "DELETE",
      });

      await fetchAllDevis();
      alert("✅ Devis supprimé");
      
      // Ajuster la page si nécessaire après suppression
      const newFilteredLength = filteredDevis.length - 1;
      const newTotalPages = Math.ceil(newFilteredLength / ITEMS_PER_PAGE);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
      alert(`❌ Erreur lors de la suppression: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Changer le statut d'un devis
  const handleStatusClick = async (devisId, currentStatus) => {
    let newStatus;
    
    // CYCLE: nouveau -> en_attente -> fini -> inactif -> nouveau
    switch (currentStatus) {
      case 'nouveau':
        newStatus = 'en_attente';
        break;
      case 'en_attente':
        newStatus = 'fini';
        break;
      case 'fini':
        newStatus = 'inactif';
        break;
      case 'inactif':
        newStatus = 'nouveau';
        break;
      default:
        newStatus = 'en_attente';
    }
    
    setLoading(true);
    try {
      await apiRequest(API_ENDPOINTS.DEVIS.UPDATE_STATUS(devisId), {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      await fetchAllDevis();
      console.log(`✅ Statut changé: ${currentStatus} → ${newStatus}`);
    } catch (err) {
      console.error("Erreur changement statut:", err);
      alert(`❌ Erreur lors du changement de statut: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Sélection des devis
  const handleSelectDevis = (devisId) => {
    setSelectedDevis(prev => 
      prev.includes(devisId) 
        ? prev.filter(id => id !== devisId)
        : [...prev, devisId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDevis.length === currentDevis.length) {
      setSelectedDevis([]);
    } else {
      setSelectedDevis(currentDevis.map(d => d._id));
    }
  };

  // Suppression en masse
  const handleBulkDelete = async () => {
    if (selectedDevis.length === 0) return;
    
    const confirmDelete = window.confirm(
      `❗ Supprimer ${selectedDevis.length} devis sélectionné(s) ?`
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await Promise.all(
        selectedDevis.map(id => 
          apiRequest(API_ENDPOINTS.DEVIS.DELETE(id), { method: "DELETE" })
        )
      );

      setSelectedDevis([]);
      await fetchAllDevis();
      alert(`✅ ${selectedDevis.length} devis supprimé(s)`);
      
      // Ajuster la page après suppression en masse
      const newFilteredLength = filteredDevis.length - selectedDevis.length;
      const newTotalPages = Math.ceil(newFilteredLength / ITEMS_PER_PAGE);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.error("Erreur suppression en masse:", err);
      alert(`❌ Erreur lors de la suppression: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions de navigation de pagination
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Générer les numéros de pages à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // FONCTIONS POUR LES STATUTS
  const getStatusColor = (status) => {
    switch (status) {
      case 'nouveau': return '#3b82f6'; // Bleu
      case 'en_attente': return '#8b5cf6'; // Violet
      case 'fini': return '#10b981'; // Vert
      case 'inactif': return '#ef4444'; // Rouge
      default: return '#3b82f6';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'nouveau': return 'Nouveau';
      case 'en_attente': return 'En attente';
      case 'fini': return 'Finalisé';
      case 'inactif': return 'Inactif';
      default: return 'Nouveau';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'nouveau': return '🔵';
      case 'en_attente': return '🟣';
      case 'fini': return '🟢';
      case 'inactif': return '🔴';
      default: return '🔵';
    }
  };

  const getNextStatusLabel = (status) => {
    switch (status) {
      case 'nouveau': return 'Cliquer pour passer en Attente';
      case 'en_attente': return 'Cliquer pour marquer Finalisé';
      case 'fini': return 'Cliquer pour passer en Inactif';
      case 'inactif': return 'Cliquer pour remettre en Nouveau';
      default: return 'Cliquer pour changer le statut';
    }
  };

  const handleDownloadPDF = async (devis) => {
    try {
      setLoading(true);
      
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '210mm';
      tempDiv.style.background = 'white';
      tempDiv.style.padding = '20px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.color = 'black';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.4';
      document.body.appendChild(tempDiv);

      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      let currentY = margin;

      const addSectionToPDF = async (htmlContent, isFirstPage = false) => {
        tempDiv.innerHTML = htmlContent;
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (currentY + imgHeight > pageHeight - margin && !isFirstPage) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 5;

        return imgHeight;
      };

      // En-tête
      await addSectionToPDF(`
        <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #f1f5f9;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 1;">
              ${devis.logoUrl ? `<img src="${devis.logoUrl}" alt="Logo" style="max-width: 200px; max-height: 100px; object-fit: contain; border-radius: 8px;">` : ''}
            </div>
            <div style="flex: 1; text-align: right;">
              <h1 style="font-size: 3rem; font-weight: 800; margin: 0; color: #0f172a; letter-spacing: 2px;">DEVIS</h1>
              <p style="font-size: 1.5rem; color: #3b82f6; font-weight: 600; margin: 0;">${devis.title || ''}</p>
            </div>
          </div>
        </div>
      `, true);

      // Informations parties
      const clientInfo = clients.find(c => c._id === (typeof devis.clientId === "object" ? devis.clientId?._id : devis.clientId)) || {};
      await addSectionToPDF(`
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-bottom: 30px;">
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 2rem; border-radius: 12px; border-left: 4px solid #3b82f6;">
            <h3 style="margin: 0 0 1.5rem 0; color: #0f172a; font-size: 1.2rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">ÉMETTEUR</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="font-weight: 600; font-size: 1.1rem; color: #0f172a;">${devis.entrepriseName || 'Nom de l\'entreprise'}</div>
              <div>${devis.entrepriseAddress || 'Adresse'}</div>
              <div>${devis.entrepriseCity || 'Code postal et ville'}</div>
              <div>${devis.entreprisePhone || 'Téléphone'}</div>
              <div>${devis.entrepriseEmail || 'Email'}</div>
            </div>
          </div>
          
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 2rem; border-radius: 12px; border-left: 4px solid #3b82f6;">
            <h3 style="margin: 0 0 1.5rem 0; color: #0f172a; font-size: 1.2rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">DESTINATAIRE</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="font-weight: 600; font-size: 1.1rem; color: #0f172a;">${clientInfo.name || devis.clientName || 'Nom du client'}</div>
              <div>${clientInfo.email || devis.clientEmail || 'Email du client'}</div>
              <div>${clientInfo.phone || devis.clientPhone || 'Téléphone du client'}</div>
              <div>${devis.clientAddress || 'Adresse du client'}</div>
            </div>
          </div>
        </div>
      `);

      // Métadonnées
      await addSectionToPDF(`
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div>
              <div style="font-weight: 600; font-size: 0.9rem; opacity: 0.9;">Date du devis :</div>
              <div style="background: rgba(255, 255, 255, 0.2); padding: 0.5rem; border-radius: 6px; font-weight: 600;">${formatDate(devis.dateDevis)}</div>
            </div>
            <div>
              <div style="font-weight: 600; font-size: 0.9rem; opacity: 0.9;">Numéro de devis :</div>
              <div style="background: rgba(255, 255, 255, 0.2); padding: 0.5rem; border-radius: 6px; font-weight: 600;">${devis.devisNumber || devis._id || 'À définir'}</div>
            </div>
            <div>
              <div style="font-weight: 600; font-size: 0.9rem; opacity: 0.9;">Date de validité :</div>
              <div style="background: rgba(255, 255, 255, 0.2); padding: 0.5rem; border-radius: 6px; font-weight: 600;">${formatDate(devis.dateValidite)}</div>
            </div>
            <div>
              <div style="font-weight: 600; font-size: 0.9rem; opacity: 0.9;">Client :</div>
              <div style="background: rgba(255, 255, 255, 0.2); padding: 0.5rem; border-radius: 6px; font-weight: 600;">${clientInfo.name || devis.clientName || 'Client non défini'}</div>
            </div>
          </div>
        </div>
      `);
      
      // Description si présente
      if (devis.description) {
        await addSectionToPDF(`
          <div style="margin-bottom: 30px;">
            <h3 style="margin: 0 0 1rem 0; color: #0f172a; font-size: 1.2rem; font-weight: 600;">Description</h3>
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; color: #475569; line-height: 1.6; white-space: pre-line;">
              ${devis.description || ''}
            </div>
          </div>
        `);
      }

      // En-tête du tableau
      await addSectionToPDF(`
        <div style="margin-bottom: 10px;">
          <h3 style="margin: 0 0 1.5rem 0; color: #0f172a; font-size: 1.3rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem;">DÉTAIL DES PRESTATIONS</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white;">
                <th style="padding: 1rem 0.75rem; text-align: center; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; width: 35%;">Description</th>
                <th style="padding: 1rem 0.75rem; text-align: center; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; width: 10%;">Unité</th>
                <th style="padding: 1rem 0.75rem; text-align: center; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; width: 10%;">Qté</th>
                <th style="padding: 1rem 0.75rem; text-align: center; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; width: 15%;">Prix unitaire HT</th>
                <th style="padding: 1rem 0.75rem; text-align: center; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; width: 10%;">TVA</th>
                <th style="padding: 1rem 0.75rem; text-align: center; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; width: 20%;">Total HT</th>
              </tr>
            </thead>
          </table>
        </div>
      `);

      // Traiter chaque ligne individuellement
      for (let i = 0; i < devis.articles.length; i++) {
        const article = devis.articles[i];
        const price = parseFloat(article.unitPrice || "0");
        const qty = parseFloat(article.quantity || "0");
        const total = isNaN(price) || isNaN(qty) ? 0 : price * qty;
        const bgColor = i % 2 === 0 ? '#ffffff' : '#f8fafc';

        await addSectionToPDF(`
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              <tr style="background: ${bgColor};">
                <td style="padding: 1rem 0.75rem; text-align: left; border-bottom: 1px solid #f1f5f9; width: 35%;">${article.description || ''}</td>
                <td style="padding: 1rem 0.75rem; text-align: center; border-bottom: 1px solid #f1f5f9; width: 10%;">${article.unit || ''}</td>
                <td style="padding: 1rem 0.75rem; text-align: center; border-bottom: 1px solid #f1f5f9; width: 10%;">${qty}</td>
                <td style="padding: 1rem 0.75rem; text-align: center; border-bottom: 1px solid #f1f5f9; width: 15%;">${price.toFixed(2)} €</td>
                <td style="padding: 1rem 0.75rem; text-align: center; border-bottom: 1px solid #f1f5f9; width: 10%;">${article.tvaRate || "20"}%</td>
                <td style="padding: 1rem 0.75rem; text-align: center; border-bottom: 1px solid #f1f5f9; width: 20%; font-weight: 600; color: #10b981;">${total.toFixed(2)} €</td>
              </tr>
            </tbody>
          </table>
        `);
      }

      // Calcul des totaux
      const tauxTVA = {
        "20": { ht: 0, tva: 0 },
        "10": { ht: 0, tva: 0 },
        "5.5": { ht: 0, tva: 0 },
        "0": { ht: 0, tva: 0 }
      };

      devis.articles.forEach((item) => {
        const price = parseFloat(item.unitPrice || "0");
        const qty = parseFloat(item.quantity || "0");
        const taux = item.tvaRate || "20";

        if (!isNaN(price) && !isNaN(qty) && tauxTVA[taux] !== undefined) {
          const ht = price * qty;
          tauxTVA[taux].ht += ht;
          tauxTVA[taux].tva += ht * (parseFloat(taux) / 100);
        }
      });

      const totalHT = Object.values(tauxTVA).reduce((sum, t) => sum + t.ht, 0);
      const totalTVA = Object.values(tauxTVA).reduce((sum, t) => sum + t.tva, 0);
      const totalTTC = totalHT + totalTVA;

      // Totaux
      await addSectionToPDF(`
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 30px 0;">
          <div>
            <h4 style="margin: 0 0 1rem 0; color: #0f172a; font-weight: 600;">Récapitulatif TVA</h4>
            <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);">
              <thead>
                <tr style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white;">
                  <th style="padding: 0.75rem; text-align: center; font-weight: 600; font-size: 0.8rem; text-transform: uppercase;">Base HT</th>
                  <th style="padding: 0.75rem; text-align: center; font-weight: 600; font-size: 0.8rem; text-transform: uppercase;">Taux TVA</th>
                  <th style="padding: 0.75rem; text-align: center; font-weight: 600; font-size: 0.8rem; text-transform: uppercase;">Montant TVA</th>
                  <th style="padding: 0.75rem; text-align: center; font-weight: 600; font-size: 0.8rem; text-transform: uppercase;">Total TTC</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(tauxTVA)
                  .filter(([, { ht }]) => ht > 0)
                  .map(([rate, { ht, tva }]) => `
                    <tr style="background: white;">
                      <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid #f1f5f9;">${ht.toFixed(2)} €</td>
                      <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid #f1f5f9;">${rate}%</td>
                      <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid #f1f5f9;">${tva.toFixed(2)} €</td>
                      <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid #f1f5f9;">${(ht + tva).toFixed(2)} €</td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem; align-self: end;">
            <div style="display: flex; justify-content: space-between; padding: 0.75rem 1rem; background: #f8fafc; border-radius: 8px; font-weight: 500; min-width: 250px;">
              <span>Total HT :</span>
              <span>${totalHT.toFixed(2)} €</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 0.75rem 1rem; background: #f8fafc; border-radius: 8px; font-weight: 500; min-width: 250px;">
              <span>Total TVA :</span>
              <span>${totalTVA.toFixed(2)} €</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 0.75rem 1rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; font-weight: 700; font-size: 1.1rem; border-radius: 8px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); min-width: 250px;">
              <span>Total TTC :</span>
              <span>${totalTTC.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      `);

      // Conditions
      await addSectionToPDF(`
        <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 2rem; border-radius: 12px; border-left: 4px solid #3b82f6; margin-top: 30px;">
          <div style="margin-bottom: 2rem;">
            <h4 style="margin: 0 0 1rem 0; color: #0f172a; font-size: 1.1rem; font-weight: 600;">Conditions</h4>
            <div style="color: #475569; line-height: 1.6; white-space: pre-line;">
              ${devis.conditions || `• Devis valable jusqu'au ${formatDate(devis.dateValidite)}\n• Règlement à 30 jours fin de mois\n• TVA non applicable, art. 293 B du CGI (si applicable)`}
            </div>
          </div>
          
          <div style="text-align: center;">
            <p style="font-style: italic; color: #64748b; margin-bottom: 2rem;">
              <em>Bon pour accord - Date et signature du client :</em>
            </p>
            <div style="display: flex; justify-content: space-around; gap: 2rem;">
              <div style="flex: 1; padding: 1rem; border-bottom: 2px solid #0f172a; color: #475569; font-weight: 500;">
                <span>Date : _______________</span>
              </div>
              <div style="flex: 1; padding: 1rem; border-bottom: 2px solid #0f172a; color: #475569; font-weight: 500;">
                <span>Signature :</span>
              </div>
            </div>
          </div>
        </div>
      `);
      
      // Pied de page
      await addSectionToPDF(`
        <div style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; text-align: center;">
          <p style="font-size: 0.85rem; color: #64748b; font-style: italic; margin: 0;">
            ${devis.footerText || `${devis.entrepriseName || 'Votre entreprise'} - ${devis.entrepriseAddress || 'Adresse'} - ${devis.entrepriseCity || 'Ville'}`}
          </p>
        </div>
      `);

      // Télécharger le PDF
      const fileName = devis.title?.replace(/[^a-zA-Z0-9]/g, '-') || `devis-${devis._id}`;
      pdf.save(`${fileName}.pdf`);

      // Nettoyer
      document.body.removeChild(tempDiv);
      
    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
      alert('❌ Erreur lors de la génération du PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && devisList.length === 0) {
    return (
      <div className="loading-state">
        <div className="loading-spinner">⏳</div>
        <p>Chargement des devis...</p>
      </div>
    );
  }

  return (
    <div className="devis-page">
      {/* En-tête avec titre et statistiques métier */}
      <div className="prospects-header">
        <div className="header-content">
          <h1 className="page-title">📄 Mes Devis</h1>
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-number">{devisList.length}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{filteredDevis.length}</span>
              <span className="stat-label">Affichés</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{selectedDevis.length}</span>
              <span className="stat-label">Sélectionnés</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{nouveauCount}</span>
              <span className="stat-label">🔵 Nouveaux</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{enAttenteCount}</span>
              <span className="stat-label">🟣 En attente</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{finiCount}</span>
              <span className="stat-label">🟢 Finalisés</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{inactifCount}</span>
              <span className="stat-label">🔴 Inactifs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{caRealise.toFixed(0)} €</span>
              <span className="stat-label">💰 CA Réalisé</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{caPotentiel.toFixed(0)} €</span>
              <span className="stat-label">🎯 CA Potentiel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="filters-section">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher par titre, client ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label>Statut :</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous</option>
              <option value="nouveau">🔵 Nouveaux</option>
              <option value="en_attente">🟣 En attente</option>
              <option value="fini">🟢 Finalisés</option>
              <option value="inactif">🔴 Inactifs</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Trier par :</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date">Plus récent</option>
              <option value="title">Titre A-Z</option>
              <option value="client">Client A-Z</option>
              <option value="amount">Montant décroissant</option>
            </select>
          </div>

          <div className="filter-actions">
            {selectedDevis.length > 0 && (
              <button 
                onClick={handleBulkDelete}
                className="bulk-delete-btn"
                disabled={loading}
              >
                🗑️ Supprimer ({selectedDevis.length})
              </button>
            )}
            
            <button 
              onClick={onCreateDevis}
              className="cta-button"
            >
              ✨ Créer un devis
            </button>
          </div>
        </div>

        {/* Informations de pagination */}
        {filteredDevis.length > 0 && (
          <div className="pagination-info">
            <span>
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredDevis.length)} sur {filteredDevis.length} devis
              {totalPages > 1 && ` (Page ${currentPage} sur ${totalPages})`}
            </span>
          </div>
        )}
      </div>

      {/* Actions en masse */}
      {currentDevis.length > 0 && (
        <div className="bulk-select-bar">
          <label className="select-all-checkbox">
            <input
              type="checkbox"
              checked={selectedDevis.length === currentDevis.length && currentDevis.length > 0}
              onChange={handleSelectAll}
            />
            <span>Sélectionner tout sur cette page ({currentDevis.length})</span>
          </label>
        </div>
      )}

      {error && (
        <div className="error-state">{error}</div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>Chargement...</p>
        </div>
      ) : filteredDevis.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>
            {searchTerm || statusFilter !== 'all' 
              ? "Aucun devis trouvé" 
              : "Aucun devis créé"
            }
          </h3>
          <p>
            {searchTerm || statusFilter !== 'all'
              ? "Essayez de modifier vos critères de recherche"
              : "Commencez par créer votre premier devis !"
            }
          </p>
          {onCreateDevis && (!searchTerm && statusFilter === 'all') && (
            <button onClick={onCreateDevis} className="cta-button">
              🆕 Créer un nouveau devis
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Grille des cartes devis */}
          <div className="devis-grid">
            {currentDevis.map((devisItem) => {
              const client = clients.find(c => c._id === (typeof devisItem.clientId === "object" ? devisItem.clientId?._id : devisItem.clientId));
              
              return (
                <div 
                  key={devisItem._id} 
                  className={`devis-card ${selectedDevis.includes(devisItem._id) ? 'selected' : ''}`}
                >
                  {/* Section supérieure */}
                  <div className="devis-card-top">
                    {/* Checkbox de sélection */}
                    <div className="card-select" style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                      <input
                        type="checkbox"
                        checked={selectedDevis.includes(devisItem._id)}
                        onChange={() => handleSelectDevis(devisItem._id)}
                      />
                    </div>

                    {/* Avatar pour le devis */}
                    <div className="devis-avatar">
                      {devisItem.title ? devisItem.title.charAt(0).toUpperCase() : "D"}
                    </div>

                    {/* Indicateur de statut */}
                    <div 
                      className="status-indicator clickable"
                      style={{ 
                        backgroundColor: getStatusColor(devisItem.status),
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem'
                      }}
                      title={getNextStatusLabel(devisItem.status)}
                      onClick={() => handleStatusClick(devisItem._id, devisItem.status)}
                    >
                      {getStatusIcon(devisItem.status)}
                    </div>
                  </div>

                  {/* Section contenu principal */}
                  <div className="devis-card-content">
                    <div className="devis-card-header">
                      <h3 className="devis-card-title">{devisItem.title || "Devis sans titre"}</h3>
                      
                      <div className="devis-card-meta">
                        <div className="devis-card-date">
                          <span>📅</span>
                          <span>{formatDate(devisItem.dateDevis)}</span>
                        </div>
                        <div className="devis-card-amount">
                          <span>💰</span>
                          <span>{calculateTTC(devisItem).toFixed(2)} € TTC</span>
                        </div>
                      </div>
                    </div>

                    {/* Informations client */}
                    <div className="devis-client-info">
                      <span className="devis-client-icon">👤</span>
                      <span className="devis-client-name">{client?.name || "Client inconnu"}</span>
                    </div>

                    {/* Badge de statut */}
                    <div className="devis-status-badge" style={{ backgroundColor: getStatusColor(devisItem.status), color: 'white' }}>
                      {getStatusIcon(devisItem.status)} {getStatusLabel(devisItem.status)}
                    </div>

                    {/* Actions */}
                    <div className="devis-card-actions">
                      <button 
                        onClick={() => onEditDevis && onEditDevis(devisItem)}
                        className="card-btn card-btn-edit"
                      >
                        ✏️ Modifier
                      </button>
                      
                      <button 
                        onClick={() => handleDownloadPDF(devisItem)}
                        className="card-btn card-btn-pdf"
                        disabled={loading}
                      >
                        {loading ? "⏳" : "📄"} PDF
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(devisItem._id)}
                        className="card-btn card-btn-delete"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contrôles de pagination */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <div className="pagination-wrapper">
                {/* Bouton Précédent */}
                <button 
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="pagination-btn pagination-prev"
                  title="Page précédente"
                >
                  ← Précédent
                </button>

                {/* Numéros de pages */}
                <div className="pagination-numbers">
                  {currentPage > 3 && totalPages > 5 && (
                    <>
                      <button 
                        onClick={() => goToPage(1)}
                        className="pagination-number"
                      >
                        1
                      </button>
                      {currentPage > 4 && <span className="pagination-ellipsis">...</span>}
                    </>
                  )}

                  {getPageNumbers().map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  {currentPage < totalPages - 2 && totalPages > 5 && (
                    <>
                      {currentPage < totalPages - 3 && <span className="pagination-ellipsis">...</span>}
                      <button 
                        onClick={() => goToPage(totalPages)}
                        className="pagination-number"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                {/* Bouton Suivant */}
                <button 
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="pagination-btn pagination-next"
                  title="Page suivante"
                >
                  Suivant →
                </button>
              </div>

              {/* Informations de pagination détaillées */}
              <div className="pagination-details">
                <span>
                  Page {currentPage} sur {totalPages} • {filteredDevis.length} devis au total
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DevisListPage;