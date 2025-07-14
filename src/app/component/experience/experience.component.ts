import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbAccordionConfig, NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [NgbAccordionModule,CommonModule],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.css'
})
export class ExperienceComponent {
  constructor(config: NgbAccordionConfig) {
    // customize default values of accordions used by this component tree
    config.closeOthers = true;
  }

  experiences = [
    {
        year: 'mai 2025 - aujourd\'hui',
        title: 'Hôte de caisse - E.Leclerc, Cernay',
        description: 'Accueil et encaissement des clients du supermarché. Gestion des transactions financières, traitement des paiements par carte et en espèces. Assurer un service client de qualité en répondant aux questions des clients et en résolvant les éventuels problèmes rencontrés. Utilisation de logiciels de caisse pour enregistrer les ventes et gérer les stocks de caisse.',
        skills: 'Gestion de la caisse, Service client, Logiciels de point de vente'
    },
    {
        year: '13/05/2024 - 28/08/2024',
        title: 'Stage de fin de licence - ISL, Saint-Louis',
        subject: 'Comptabilité analytique',
        description: 'Mise en œuvre de protocoles pour l\'extraction sécurisée de données du système d\'information des ressources humaines, en assurant la confidentialité et l\'intégrité des informations. Ces données étaient ensuite mises à disposition du personnel autorisé, en fonction de leur appartenance à des groupes spécifiques au sein de l\'organisation.Utilisation de techniques de chiffrement et d\'authentification pour protéger les données lors de leur transfert et de leur stockage. Collaboration avec les responsables des ressources humaines pour définir les niveaux d\'accès et garantir que seules les personnes habilitées pouvaient consulter les informations pertinentes. Formation des utilisateurs finaux sur les bonnes pratiques de sécurité des données et rédaction de documentation technique pour soutenir ces processus.',
        skills: 'Bases de données, Comptabilité analytique, Sécurité informatique, SQL, VBA, Microsoft Ecxel'
    },
    {
        year: 'février 2023 - mai 2025',
        title: 'Préparateur de commandes - CERP RRM, Illzach',
        description: 'Préparation et vérification des commandes de médicaments et de matériel médical destinées aux pharmacies de la région de Mulhouse. Utilisation de systèmes de gestion d\'entrepôt pour localiser et rassembler les articles commandés. Emballage et étiquetage des commandes en respectant les normes de sécurité et de qualité. Collaboration avec les équipes logistiques pour assurer la livraison en temps voulu et la gestion des stocks.',
        skills: 'Préparation de commandes, Gestion des stocks, Logistique, Systèmes de gestion d\'entrepôt'
    },
    {
        year: '27/06/2022 - 09/09/2022',
        title: 'Transfert de base de données - GRG Alsace, Strasbourg',
        description: 'Participation à l\'inventaire, au chargement et au déchargement de camions. Assistance à la migration du système informatique de l\'entreprise depuis une base de données Microsoft Access vers le logiciel WSM Akanéa. Nettoyage et validation des données pour assurer leur intégrité lors du transfert. Formation des utilisateurs finaux sur le nouveau système et rédaction de documentation technique pour soutenir la transition.',
        skills: 'Administration de bases de données, Migration de données, Microsoft Access, WSM Akanéa'
    },
    {
        year: '28/10/2020 - 30/01/2021',
        title: 'Préparateur de commandes - Bell Suisse SA, Bâle',
        description: 'Préparation et emballage de commandes de produits de poissonnerie pour les supermarchés COOP. Utilisation de systèmes de gestion des stocks pour suivre les niveaux de produits et assurer la disponibilité des articles. Collaboration avec les équipes de logistique pour organiser les livraisons et maintenir la chaîne du froid. Respect des normes d\'hygiène et de sécurité alimentaire.',
        skills: 'Préparation de commandes, Gestion des stocks, Logistique, Hygiène et sécurité alimentaire'
    },
    {
        year: 'Étés 2017, 2018, 2019, 2021',
        title: 'Manutentionnaire - GRG Alsace, Strasbourg',
        description: 'Réalisation d\'inventaires, chargement et déchargement de camions. Utilisation d\'équipements de manutention pour déplacer des marchandises en toute sécurité. Collaboration avec les équipes de logistique pour organiser les livraisons et les réceptions de marchandises. Respect des procédures de sécurité pour prévenir les accidents et assurer un environnement de travail sûr.',
        skills: 'Manutention, Logistique, Utilisation d\'équipements de manutention, Sécurité au travail'
    },
    {
        year: '31/08/2020 - 13/09/2021',
        title: 'Vendeur - Supermarché Match, Huningue',
        description: 'Responsable du réapprovisionnement et de l\'entretien du rayon fruits et légumes. Accueil et conseil des clients sur les produits disponibles. Gestion des stocks et commande de marchandises auprès des fournisseurs. Participation à la mise en place des promotions et à l\'organisation des présentoirs pour attirer les clients.',
        skills: 'Vente, Gestion de rayon, Service client, Gestion des stocks'
    },
    {
        year: 'Janvier 2016',
        title: 'Stage d\'observation : Service Informatique - Journal l\'Alsace, Mulhouse',
        description: 'Observation et participation aux activités de maintenance des informaticiens du journal L\'Alsace. Assistance à la résolution de problèmes techniques et au support aux utilisateurs. Familiarisation avec les systèmes de gestion de contenu et les outils de publication numérique. Participation à des projets de mise à jour des équipements informatiques et de maintenance des réseaux.',
        skills: 'Maintenance informatique, Support technique, Systèmes de gestion de contenu'
    },
    {
        year: 'Été 2015',
        title: 'Ouvrier agricole - EARL Fix, Fessenheim-le-Bas',
        description: 'Tri et préparation du tabac pour une petite exploitation agricole. Participation aux activités de récolte et de traitement des produits agricoles. Utilisation d\'outils et de machines agricoles pour effectuer les tâches de tri et de conditionnement. Collaboration avec les autres ouvriers agricoles pour assurer le bon déroulement des opérations.',
        skills: 'Travail agricole, Tri de produits, Utilisation de machines agricoles, Travail d\'équipe'
    }
  ];
}
