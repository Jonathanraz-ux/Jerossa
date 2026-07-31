export const blogPosts = [
  {
    id: 'blog-001',
    title: 'Comment reconnaître une vanille Bourbon de qualité',
    excerpt: 'Découvrez les critères d\'une vanille Bourbon premium et comment les identifier parmi les nombreuses offres du marché.',
    image: 'https://images.unsplash.com/photo-1610487512810-b614ad747572?w=800&auto=format&fit=crop&q=80',
    category: 'Guide',
    date: '2026-06-15',
    author: 'Jerossa Team',
    content: 'La vanille Bourbon de Madagascar est reconnue dans le monde entier pour sa qualité exceptionnelle. Mais comment distinguer une vanille truly premium des produits de moindre qualité ? Voici nos conseils d\'expert.\n\nLa première chose à vérifier est la longueur de la gousse. Une vanille Bourbon de qualité mesure entre 16 et 22 cm. Les gousses trop courtes indiquent souvent une récolte prématurée.\n\nEnsuite, observez la couleur. Une vanille Bourbon premium a une couleur brun foncé uniforme, avec une légère pellicule blanche naturelle appelée "vanilline".\n\nEnfin, n\'hésitez pas à sentir la gousse. Une vanille de qualité dégage un arôme riche et complexe, avec des notes de chocolat, de fleur et de bois.'
  },
  {
    id: 'blog-002',
    title: 'Les bienfaits du Ravintsara pour la santé',
    excerpt: 'L\'huile essentielle de Ravintsara est un remède naturel puissant. Découvrez ses propriétés antivirales et ses nombreuses applications.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&auto=format&fit=crop&q=80',
    category: 'Bien-être',
    date: '2026-05-28',
    author: 'Dr. M. Rajoelina',
    content: 'Le Ravintsara (Cinnamomum camphora ct cinéole) est un arbre originaire de Madagascar dont l\'huile essentielle est reconnue pour ses remarquables propriétés antivirales.\n\nChimiquement, le Ravintsara se distingue par sa forte teneur en 1,8-cinéole (eucalyptol), souvent supérieur à 60%. Ce composé est responsable de ses effets expectorants et antiviraux.\n\nEn aromathérapie, le Ravintsara est utilisé pour:\n- Soulager les infections respiratoires\n- Renforcer le système immunitaire\n- Apaiser les inflammations\n\nNotre huile essentielle de Ravintsara est chémotypée et 100% pure et intégrale, garantissant une qualité optimale.'
  },
  {
    id: 'blog-003',
    title: 'Le cacao Criollo: l\'or noir de Madagascar',
    excerpt: 'Le cacao Criollo est considéré comme le plus rare et le plus fin au monde. Découvrez pourquoi les fèves de Madagascar sont si prisées.',
    image: 'https://images.unsplash.com/photo-1610450949065-1f2841536c88?w=800&auto=format&fit=crop&q=80',
    category: 'Découvertes',
    date: '2026-04-10',
    author: 'Jerossa Team',
    content: 'Le cacao Criollo représente moins de 5% de la production mondiale de cacao, ce qui en fait l\'une des variétés les plus rares et les plus prisées par les chocolatiers d\'exception.\n\nLes fèves de cacao Criollo de Madagascar se distinguent par:\n- Une couleur claire allant du violet au brun rosé\n- Un goût complexe avec des notes de fruits rouges et d\'agrumes\n- Un faible taux de tanins, évitant l\'amertume\n\nLa vallée du Sambirano, au nord-ouest de Madagascar, offre des conditions idéales pour la culture du Criollo: un sol volcanique riche, un climat tropical humide et une altitude parfaite.'
  },
  {
    id: 'blog-004',
    title: 'Le commerce équitable à Madagascar: notre engagement',
    excerpt: 'Découvrez comment Jerossa soutient les producteurs malgaches à travers le commerce équitable et des partenariats durables.',
    image: 'https://images.unsplash.com/photo-1610487512810-b614ad747572?w=800&auto=format&fit=crop&q=80',
    category: 'Engagement',
    date: '2026-03-22',
    author: 'Jerossa Team',
    content: 'Chez Jerossa, nous croyons que le commerce peut être un force du bien. C\'est pourquoi nous nous engageons en faveur du commerce équitable à chaque étape de notre chaîne d\'approvisionnement.\n\nNos principes:\n- Rémunération juste: nous payons nos producteurs 30% au-dessus du prix du marché\n- Transparence: chaque produit est traçable de la ferme à votre porte\n- Développement: nous investissons dans les infrastructures locales\n\nDepuis 2015, notre programme a permis de financer 12 écoles rurales et 3 centres de santé dans les régions productrices.'
  }
];

export const getBlogPostBySlug = (slug) => {
  const post = blogPosts.find(p => p.title.toLowerCase().replace(/\s+/g, '-') === slug);
  return post || null;
};

export const getBlogPostsByCategory = (category) => {
  return blogPosts.filter(p => p.category === category);
};