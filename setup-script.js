// Script pour créer un compte abonné avec 20 prospects
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

// Modèles
const User = require('./Backend/models/User');
const Client = require('./Backend/models/Client');

// Configuration de la base de données
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crm-database')
  .then(() => console.log('✅ Connexion à MongoDB réussie'))
  .catch(err => console.error('❌ Erreur de connexion à MongoDB:', err));

// Fonction pour créer un utilisateur avec abonnement actif
const createSubscribedUser = async () => {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: 'admin@test.com' });
    
    if (existingUser) {
      console.log('⚠️ L\'utilisateur admin@test.com existe déjà, mise à jour de son abonnement...');
      
      // Mettre à jour l'abonnement
      existingUser.subscriptionStatus = 'active';
      existingUser.stripeCustomerId = 'cus_' + faker.string.alphanumeric(14);
      existingUser.stripeSubscriptionId = 'sub_' + faker.string.alphanumeric(14);
      
      // Définir la date de fin d'abonnement à 1 mois dans le futur
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
      existingUser.subscriptionEndDate = subscriptionEndDate;
      
      await existingUser.save();
      console.log('✅ Abonnement mis à jour pour admin@test.com');
      return existingUser;
    }
    
    // Créer un nouvel utilisateur
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Définir la date de fin d'abonnement à 1 mois dans le futur
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    
    const newUser = new User({
      name: 'Admin Test',
      email: 'admin@test.com',
      password: hashedPassword,
      createdAt: new Date(),
      // Informations d'abonnement
      stripeCustomerId: 'cus_' + faker.string.alphanumeric(14),
      stripeSubscriptionId: 'sub_' + faker.string.alphanumeric(14),
      subscriptionStatus: 'active',
      subscriptionEndDate: subscriptionEndDate,
      hasHadTrial: true
    });
    
    await newUser.save();
    console.log('✅ Utilisateur admin@test.com créé avec succès');
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Mot de passe: password123');
    return newUser;
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
    throw error;
  }
};

// Fonction pour générer un statut aléatoire
const getRandomStatus = () => {
  const statuses = ['nouveau', 'en_attente', 'active', 'inactive'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Fonction pour créer des prospects
const createProspects = async (userId, count = 20) => {
  try {
    const prospects = [];
    
    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      
      const prospect = new Client({
        userId,
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        phone: faker.phone.number('06########'),
        company: Math.random() > 0.3 ? faker.company.name() : '',
        address: faker.location.streetAddress(),
        postalCode: faker.location.zipCode('#####'),
        city: faker.location.city(),
        status: getRandomStatus(),
        notes: Math.random() > 0.5 ? faker.lorem.paragraph() : '',
        createdAt: faker.date.past({ years: 0.5 }),
        updatedAt: new Date()
      });
      
      await prospect.save();
      prospects.push(prospect);
      
      console.log(`✅ Prospect créé: ${prospect.name}`);
    }
    
    console.log(`✅ ${count} prospects créés avec succès`);
    return prospects;
  } catch (error) {
    console.error('❌ Erreur lors de la création des prospects:', error);
    throw error;
  }
};

// Fonction principale
const main = async () => {
  try {
    console.log('🚀 Démarrage du script de configuration...');
    
    // Créer un utilisateur avec abonnement
    const user = await createSubscribedUser();
    
    // Créer 20 prospects pour cet utilisateur
    await createProspects(user._id, 20);
    
    console.log('✅ Configuration terminée avec succès!');
    console.log('📊 Résumé:');
    console.log('👤 Utilisateur: admin@test.com (mot de passe: password123)');
    console.log('💼 Statut abonnement: Actif');
    console.log('👥 Prospects: 20');
    console.log('\n🔑 Vous pouvez maintenant vous connecter avec ces identifiants');
    
    // Fermer la connexion à la base de données
    await mongoose.connection.close();
    console.log('👋 Connexion à la base de données fermée');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du script:', error);
  } finally {
    // S'assurer que la connexion est fermée même en cas d'erreur
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('👋 Connexion à la base de données fermée');
    }
    process.exit(0);
  }
};

// Exécuter le script
main();