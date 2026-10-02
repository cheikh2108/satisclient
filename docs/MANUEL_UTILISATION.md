# Manuel d'utilisation SatisClient

**Version :** 1.0  
**Date :** 1er octobre 2026  
**Public :** administrateurs de plateforme, administrateurs d'organisation, managers et agents

## 1. Présentation

SatisClient est une plateforme multi-organisation de pilotage de la satisfaction client. Elle permet de :

- recueillir des feedbacks publics ou authentifiés ;
- gérer les réclamations et leur délai de traitement ;
- créer des enquêtes ponctuelles, récurrentes ou continues ;
- diffuser des enquêtes et des formulaires par QR code ;
- analyser les résultats et exporter des rapports ;
- gérer les utilisateurs, sites, fichiers, notifications et journaux d'audit ;
- administrer les abonnements et les packs de campagnes.

L'accès est organisé par organisation. Un utilisateur ne voit normalement que les données de son organisation. Le `super_admin` dispose d'une vue plateforme séparée.

## 2. Accès et connexion

### 2.1 Se connecter

1. Ouvrir l'URL de l'application.
2. Saisir l'adresse email.
3. Saisir le mot de passe.
4. Cliquer sur **Se connecter**.

La session utilise des cookies sécurisés. Si la session expire, l'application tente automatiquement de la renouveler. Si le renouvellement échoue, l'utilisateur est redirigé vers la page de connexion.

### 2.2 Mot de passe oublié

1. Cliquer sur **Mot de passe oublié ?**.
2. Saisir l'adresse email.
3. Ouvrir le lien reçu par email.
4. Définir un nouveau mot de passe respectant les règles affichées.

Le lien est temporaire. La demande ne révèle pas si une adresse existe dans la base.

### 2.3 Première activation d'une organisation

Quand un `super_admin` crée directement une organisation :

1. un compte `org_admin` est créé avec l'adresse de l'organisation ;
2. un lien d'activation est envoyé par Resend ;
3. le destinataire clique sur **Définir mon mot de passe et activer mon accès** ;
4. il choisit son mot de passe ;
5. il se connecte avec l'adresse de l'organisation.

Le mot de passe temporaire n'est jamais envoyé par email.

## 3. Rôles et responsabilités

| Rôle              | Usage principal                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| `super_admin`     | Administration de la plateforme, organisations, utilisateurs, audit, ventes de campagnes et statistiques globales. |
| `org_admin`       | Administration complète de son organisation, utilisateurs, sites, abonnements et achats de packs.                  |
| `director`        | Consultation et pilotage selon les accès de direction.                                                             |
| `quality_manager` | Suivi de la qualité, feedbacks, réclamations, enquêtes, rapports et analytics.                                     |
| `service_manager` | Suivi opérationnel des feedbacks, réclamations, sites et utilisateurs autorisés.                                   |
| `agent`           | Traitement opérationnel des feedbacks et réclamations.                                                             |
| `client`          | Consultation limitée des feedbacks selon les accès prévus.                                                         |

La création d'une enquête est actuellement autorisée aux rôles `super_admin`, `org_admin` et `quality_manager`. L'achat d'un pack campagne est réservé à `org_admin`.

> Les rôles personnalisés peuvent être enregistrés et administrés, mais le contrôle d'accès principal de l'application repose encore sur les rôles système.

## 4. Tableau de bord

Le tableau de bord présente les indicateurs disponibles selon le rôle.

### 4.1 Vue organisation

Elle permet notamment de suivre :

- le volume de feedbacks ;
- les réclamations ;
- les tendances temporelles ;
- la satisfaction et les indicateurs NPS/CSAT/CES lorsque disponibles ;
- les sites et leur activité ;
- les scans de QR codes.

### 4.2 Vue super-administrateur

La vue plateforme présente :

- le nombre d'organisations, utilisateurs et établissements ;
- l'activité globale ;
- les ventes de packs campagne ;
- le chiffre d'affaires campagne ;
- les crédits vendus, consommés et restants ;
- les packs proches de l'expiration ;
- l'activité campagne par organisation.

## 5. Organisations

Le menu **Organisations** est destiné au `super_admin`.

### 5.1 Créer une organisation

1. Cliquer sur **Nouvelle organisation**.
2. Saisir le nom et l'adresse email de l'organisation.
3. Renseigner éventuellement le téléphone, le logo, le site web, le secteur, le pays et la description.
4. Choisir le plan initial.
5. Valider.

La plateforme crée un essai de 7 jours, initialise les limites du plan et envoie l'invitation d'activation à l'adresse indiquée.

### 5.2 Modifier une organisation

Les champs disponibles comprennent :

- nom et coordonnées ;
- logo et couleur principale ;
- message d'accueil ;
- site web et description ;
- secteur et pays ;
- informations de facturation.

Le `super_admin` peut gérer les organisations clientes. Un administrateur d'organisation ne modifie que les éléments autorisés de sa propre organisation.

## 6. Sites et établissements

Le menu **Établissements** permet de représenter la structure opérationnelle.

### 6.1 Créer un établissement

1. Cliquer sur **Ajouter un établissement**.
2. Choisir l'organisation et le type : organisation, région, agence, service ou point.
3. Saisir le nom et le code.
4. Ajouter l'adresse, la ville, la région, le pays et les coordonnées si nécessaire.
5. Choisir éventuellement un parent et un responsable.
6. Enregistrer.

Un quota de sites dépend du plan d'abonnement. Un site peut être désactivé sans supprimer ses données historiques.

### 6.2 Hiérarchie

Les sites peuvent être organisés en niveaux parent/enfant. Utiliser la hiérarchie pour refléter les régions, agences, services et points d'accueil.

## 7. Utilisateurs et profils

### 7.1 Gérer les utilisateurs

Le menu **Utilisateurs** permet de :

- consulter la liste des utilisateurs ;
- filtrer par rôle ou statut ;
- créer et modifier un utilisateur ;
- désactiver ou supprimer un compte selon les droits ;
- consulter les statistiques utilisateurs.

Le nombre d'utilisateurs est limité par le plan.

### 7.2 Profil personnel

Dans **Paramètres**, l'utilisateur peut modifier :

- prénom et nom ;
- téléphone ;
- biographie ;
- préférences d'interface et de notification ;
- mot de passe ;
- sessions actives.

Les sessions peuvent être révoquées individuellement. Un changement de mot de passe révoque les sessions existantes selon la politique de sécurité.

## 8. Feedbacks

### 8.1 Consulter les feedbacks

Le menu **Feedbacks** permet de consulter les avis reçus et de filtrer par :

- site ;
- date ;
- note ;
- sentiment ;
- statut ou traitement.

Un feedback peut être anonyme ou associé à un nom, une adresse email ou un téléphone.

### 8.2 Parcours public

Un client peut répondre sans compte depuis :

- un lien public ;
- un QR code lié à un site ;
- un formulaire généré par la plateforme.

Le formulaire peut demander une note, un commentaire et des coordonnées facultatives.

## 9. Réclamations

Le menu **Réclamations** transforme le suivi d'un problème en ticket opérationnel.

### 9.1 Créer une réclamation

1. Cliquer sur **Nouvelle réclamation**.
2. Sélectionner le site concerné.
3. Saisir le sujet et la description.
4. Choisir la priorité : faible, normale, haute ou urgente.
5. Ajouter les coordonnées du demandeur si disponibles.
6. Enregistrer.

Chaque ticket possède un numéro unique.

### 9.2 Traiter une réclamation

Le responsable peut :

- affecter le ticket à un utilisateur ;
- changer son statut ;
- ajouter un commentaire ;
- demander des informations ;
- résoudre puis clôturer ;
- rouvrir ou rejeter ;
- escalader le ticket.

Les statuts couvrent notamment reçu, qualifié, affecté, en cours, en attente, résolu, fermé et rouvert.

### 9.3 SLA

La plateforme calcule les échéances SLA et identifie les tickets en retard ou critiques. Les statistiques SLA sont disponibles dans les vues et rapports concernés.

## 10. Suggestions

Le menu **Suggestions** permet de recueillir et piloter les idées d'amélioration.

Une suggestion peut contenir :

- une catégorie ;
- une description ;
- un impact attendu ;
- des votes positifs ou négatifs ;
- un responsable ;
- une note d'implémentation.

Les statuts disponibles vont de soumise à implémentée, rejetée ou archivée.

## 11. Enquêtes et campagnes

### 11.1 Types d'enquêtes

| Type       | Règle commerciale                                      |
| ---------- | ------------------------------------------------------ |
| Ponctuelle | Campagne payante, un crédit requis.                    |
| Récurrente | Campagne payante, un crédit requis par enquête créée.  |
| Continue   | Couverte par l'abonnement, aucun pack campagne requis. |

Une enquête cible un ou plusieurs établissements et contient une ou plusieurs questions.

### 11.2 Créer une enquête

1. Ouvrir **Enquêtes**.
2. Cliquer sur **Nouvelle enquête**.
3. Saisir le titre et la description.
4. Choisir le type d'enquête.
5. Pour une enquête ponctuelle ou récurrente, sélectionner un crédit campagne disponible.
6. Sélectionner les établissements ciblés.
7. Ajouter les questions.
8. Choisir le type de réponse de chaque question.
9. Enregistrer.

Les types de questions comprennent notamment :

- note sur 5 ;
- NPS sur 10 ;
- choix unique ;
- choix multiples ;
- oui/non ;
- texte libre ;
- email ;
- téléphone ;
- date ;
- échelle.

Une question de type **Note sur 5** s'affiche au public sous forme de cinq étoiles.

### 11.3 Packs campagne

Les packs actuellement disponibles sont :

| Pack         | Prix indicatif | Crédits | Validité |
| ------------ | -------------: | ------: | -------: |
| `single`     |     75 000 XOF |       1 | 30 jours |
| `frequency2` |    130 000 XOF |       2 |  12 mois |
| `frequency3` |    180 000 XOF |       3 |  12 mois |
| `frequency4` |    220 000 XOF |       4 |  12 mois |

L'achat se fait dans **Paramètres > Abonnement / Campagnes** par un `org_admin`. Le crédit est consommé uniquement lorsque la création de l'enquête réussit. La décrémentation est atomique.

### 11.4 Consulter les réponses

Dans la liste des enquêtes, cliquer sur **Réponses**. La fenêtre affiche :

- le nombre de réponses ;
- le caractère anonyme ou l'email du participant ;
- la date de soumission ;
- les questions et les réponses correspondantes.

Les réponses sont également disponibles dans les analytics et rapports selon les droits.

## 12. QR codes

### 12.1 Créer un QR code

1. Ouvrir **QR Codes**.
2. Cliquer sur **Nouveau QR code**.
3. Choisir le site.
4. Choisir le type : feedback ou enquête.
5. Pour une enquête, sélectionner l'enquête concernée.
6. Générer et télécharger le QR code.

### 12.2 Suivi

La liste permet de consulter :

- le code et sa destination ;
- le type ;
- le site ;
- le nombre de scans ;
- la date du dernier scan ;
- le statut actif ou inactif.

Le compteur est enregistré par un appel dédié afin d'éviter les doubles comptages liés aux rechargements de page ou aux effets React en développement.

## 13. Analytics et rapports

### 13.1 Analytics

Les analytics présentent les tendances, comparaisons de sites et indicateurs de satisfaction. Utiliser les filtres de période et de site pour isoler un périmètre.

### 13.2 Exporter un rapport

Dans **Rapports** :

1. choisir le type de rapport ;
2. sélectionner la période ;
3. sélectionner éventuellement le site ou l'enquête ;
4. choisir PDF, Excel ou CSV ;
5. lancer la génération.

Rapports disponibles : réclamations, analytics, enquêtes, feedbacks, utilisateurs et sites.

## 14. Notifications

Le menu **Notifications** permet de consulter les notifications persistées, les non-lues et les statistiques. L'utilisateur peut gérer les préférences disponibles et marquer une notification ou toutes les notifications comme lues.

Les canaux sont modélisés pour l'in-app, l'email, le SMS et WhatsApp. Les notifications métier email/SMS/WhatsApp restent limitées ou différées selon la configuration du projet.

## 15. Fichiers

Le menu **Fichiers** permet de :

- téléverser un fichier ;
- consulter les fichiers de l'organisation ;
- télécharger un fichier ;
- supprimer un fichier.

Les formats courants acceptés comprennent les images, PDF, documents Office, texte et CSV. La limite standard est de 10 Mo par fichier.

## 16. Audit et recherche

### Audit

Le menu **Audit** permet aux utilisateurs habilités de consulter les connexions, actions, entités modifiées, résultats, adresses IP et chemins de requête.

### Recherche globale

La recherche de la barre supérieure couvre les utilisateurs, sites, feedbacks, réclamations et enquêtes. Saisir au moins deux caractères. Les résultats sont limités et filtrés par organisation.

## 17. Paramètres et abonnement

Les paramètres regroupent :

- profil ;
- organisation et marque ;
- notifications ;
- sécurité ;
- apparence ;
- langue, fuseau et format de date ;
- plan et quotas ;
- achat de packs campagne.

La modification directe d'un plan n'est pas un remplacement du paiement DexPay. Les changements commerciaux passent par le checkout prévu.

## 18. Conseils d'exploitation

- Vérifier le site ciblé avant de publier un QR code.
- Désactiver un QR code ou une enquête qui ne doit plus être utilisé.
- Vérifier la date d'expiration d'un pack avant de lancer une campagne.
- Exporter régulièrement les rapports importants.
- Utiliser des rôles limités pour les utilisateurs opérationnels.
- Ne jamais partager un mot de passe ou une clé API.
- En cas de changement de mot de passe, contrôler les sessions actives.

## 19. Limites connues

- La 2FA n'est pas encore active.
- Les notifications métier email/SMS/WhatsApp ne sont pas toutes envoyées réellement.
- Les emails Resend sont principalement utilisés pour l'authentification et l'activation d'organisation.
- Les rôles personnalisés sont stockés mais le contrôle d'accès repose encore sur les rôles système.
- La recherche est une recherche par contenu, pas un moteur full-text dédié.
- Les boucles de hiérarchie de sites nécessitent encore un contrôle renforcé.

## 20. Support et diagnostic rapide

| Symptôme                      | Vérification                                                                            |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| Redirection vers la connexion | Vérifier les cookies, la session et le renouvellement JWT.                              |
| Enquête impossible à créer    | Vérifier le type, le crédit, l'expiration du pack, les sites et les questions.          |
| Aucun email reçu              | Vérifier `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, le domaine vérifié et les logs backend. |
| QR non fonctionnel            | Vérifier que le QR est actif, lié au bon site et non expiré.                            |
| Données absentes              | Vérifier l'organisation sélectionnée et les droits du rôle.                             |
| Erreur après déploiement      | Rebuilder les conteneurs backend et frontend, puis faire `Ctrl + F5`.                   |
