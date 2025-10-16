/**
 * Mental Wellness Spaces - Categories and Benefits
 * Spaces that passively improve mental health and support mind bridging
 */

export const wellnessCategories = {
  parks: {
    name: 'Parks & Green Spaces',
    icon: 'park',
    color: '#4CAF50',
    searchTerms: ['park', 'garden', 'green space', 'nature reserve', 'botanical garden'],
    benefits: [
      'Reduces stress and anxiety through nature exposure',
      'Improves mood and emotional well-being',
      'Encourages physical activity and outdoor time',
      'Provides peaceful spaces for reflection and mindfulness',
      'Connects people with nature for mental restoration'
    ],
    description: 'Natural green spaces that provide mental restoration through connection with nature, fresh air, and peaceful environments.'
  },
  
  playgrounds: {
    name: 'Playgrounds & Recreation Areas',
    icon: 'child_friendly',
    color: '#FF9800',
    searchTerms: ['playground', 'recreation area', 'play area', 'children park'],
    benefits: [
      'Promotes social interaction and community bonding',
      'Encourages physical activity and play',
      'Reduces isolation through family-friendly environments',
      'Supports childhood development and joy',
      'Creates opportunities for intergenerational connections'
    ],
    description: 'Interactive spaces that foster joy, play, and social connections for all ages.'
  },
  
  community: {
    name: 'Community Centers',
    icon: 'groups',
    color: '#2196F3',
    searchTerms: ['community center', 'community hall', 'civic center', 'neighborhood center'],
    benefits: [
      'Builds social connections and reduces isolation',
      'Provides access to support groups and activities',
      'Offers educational and skill-building opportunities',
      'Creates sense of belonging and community',
      'Facilitates volunteer opportunities and civic engagement'
    ],
    description: 'Gathering spaces that strengthen community bonds and provide social support networks.'
  },
  
  fitness: {
    name: 'Gyms & Fitness Centers',
    icon: 'fitness_center',
    color: '#E91E63',
    searchTerms: ['gym', 'fitness center', 'health club', 'recreation center', 'sports center'],
    benefits: [
      'Releases endorphins that improve mood naturally',
      'Reduces symptoms of depression and anxiety',
      'Builds confidence through physical achievement',
      'Provides structured routine and goals',
      'Creates opportunities for social interaction'
    ],
    description: 'Physical activity spaces that boost mental health through exercise and social engagement.'
  },
  
  libraries: {
    name: 'Libraries & Learning Spaces',
    icon: 'local_library',
    color: '#9C27B0',
    searchTerms: ['library', 'public library', 'learning center', 'study space'],
    benefits: [
      'Provides quiet, peaceful environments for mental clarity',
      'Offers free access to knowledge and personal growth',
      'Creates safe, welcoming community spaces',
      'Supports lifelong learning and cognitive health',
      'Facilitates social programs and community events'
    ],
    description: 'Quiet sanctuaries for learning, reflection, and intellectual growth that support mental wellness.'
  },
  
  waterfront: {
    name: 'Waterfront & Beaches',
    icon: 'waves',
    color: '#00BCD4',
    searchTerms: ['beach', 'waterfront', 'lake', 'river', 'marina', 'pier'],
    benefits: [
      'Provides calming effects through water sounds and views',
      'Offers natural stress relief and relaxation',
      'Encourages mindfulness and present-moment awareness',
      'Supports vitamin D production through sun exposure',
      'Creates opportunities for peaceful contemplation'
    ],
    description: 'Water-adjacent spaces that offer natural tranquility and stress relief through aquatic environments.'
  },
  
  trails: {
    name: 'Walking Trails & Paths',
    icon: 'hiking',
    color: '#795548',
    searchTerms: ['trail', 'walking path', 'hiking trail', 'bike path', 'greenway'],
    benefits: [
      'Promotes physical activity and cardiovascular health',
      'Encourages mindful walking and meditation',
      'Provides connection with nature and fresh air',
      'Offers opportunities for social walking groups',
      'Supports routine and goal-setting for mental health'
    ],
    description: 'Pathways that encourage movement, mindfulness, and connection with natural environments.'
  },
  
  gardens: {
    name: 'Community Gardens',
    icon: 'eco',
    color: '#8BC34A',
    searchTerms: ['community garden', 'urban garden', 'allotment', 'garden center'],
    benefits: [
      'Provides therapeutic benefits through gardening activities',
      'Connects people with nature and growing cycles',
      'Builds community through shared gardening projects',
      'Offers sense of accomplishment and purpose',
      'Supports mindfulness through hands-on activities'
    ],
    description: 'Collaborative growing spaces that nurture both plants and community mental wellness.'
  },
  
  arts: {
    name: 'Arts & Cultural Spaces',
    icon: 'palette',
    color: '#FF5722',
    searchTerms: ['art center', 'cultural center', 'museum', 'gallery', 'theater'],
    benefits: [
      'Stimulates creativity and self-expression',
      'Provides cultural enrichment and inspiration',
      'Offers therapeutic benefits through art engagement',
      'Creates opportunities for social and cultural connection',
      'Supports cognitive health through creative activities'
    ],
    description: 'Creative spaces that inspire, educate, and provide therapeutic benefits through arts and culture.'
  },
  
  spiritual: {
    name: 'Spiritual & Meditation Spaces',
    icon: 'self_improvement',
    color: '#673AB7',
    searchTerms: ['meditation center', 'spiritual center', 'yoga studio', 'wellness center'],
    benefits: [
      'Provides spaces for mindfulness and meditation',
      'Supports spiritual well-being and inner peace',
      'Offers stress reduction through contemplative practices',
      'Creates community around wellness practices',
      'Facilitates personal growth and self-reflection'
    ],
    description: 'Contemplative spaces dedicated to inner peace, mindfulness, and spiritual wellness.'
  }
}

/**
 * Get wellness category by type
 */
export function getWellnessCategory(type) {
  return wellnessCategories[type] || null
}

/**
 * Get all wellness categories as array
 */
export function getAllWellnessCategories() {
  return Object.entries(wellnessCategories).map(([key, category]) => ({
    key,
    ...category
  }))
}

/**
 * Get search terms for all categories
 */
export function getAllSearchTerms() {
  return Object.values(wellnessCategories)
    .flatMap(category => category.searchTerms)
}

/**
 * Find category by search term
 */
export function findCategoryBySearchTerm(searchTerm) {
  const term = searchTerm.toLowerCase()
  
  for (const [key, category] of Object.entries(wellnessCategories)) {
    if (category.searchTerms.some(t => t.toLowerCase().includes(term) || term.includes(t.toLowerCase()))) {
      return { key, ...category }
    }
  }
  
  return null
}

/**
 * Mental wellness tips for different spaces
 */
export const wellnessTips = {
  general: [
    'Take deep breaths and be present in the moment',
    'Notice the sounds, smells, and sights around you',
    'Practice gratitude for having access to this space',
    'Allow yourself to disconnect from digital devices',
    'Use this time for self-reflection and mental restoration'
  ],
  
  parks: [
    'Practice forest bathing - simply being present among trees',
    'Try grounding exercises by walking barefoot on grass',
    'Use park benches for mindful sitting meditation',
    'Observe wildlife and nature patterns mindfully',
    'Bring a journal for nature-inspired reflection'
  ],
  
  fitness: [
    'Focus on how exercise makes you feel, not just physical goals',
    'Use workout time as moving meditation',
    'Celebrate small achievements and progress',
    'Connect with others who share fitness interests',
    'Remember that any movement is beneficial for mental health'
  ],
  
  community: [
    'Engage in conversations with community members',
    'Volunteer for activities that give you purpose',
    'Attend events that align with your interests',
    'Share your skills and learn from others',
    'Build supportive relationships within your community'
  ]
}

/**
 * Sample wellness locations for demonstration
 */
export const sampleWellnessLocations = [
  {
    name: 'Central Park',
    category: 'parks',
    coordinates: [-73.9665, 40.7812],
    description: 'Iconic urban park offering green space, walking paths, and natural beauty in the heart of the city.',
    features: ['Walking trails', 'Lakes', 'Playgrounds', 'Open lawns', 'Wildlife viewing']
  },
  {
    name: 'Brooklyn Bridge Park',
    category: 'waterfront',
    coordinates: [-73.9969, 40.7023],
    description: 'Waterfront park with stunning views, recreational activities, and peaceful spaces along the East River.',
    features: ['Water views', 'Piers', 'Sports facilities', 'Gardens', 'Event spaces']
  },
  {
    name: 'New York Public Library',
    category: 'libraries',
    coordinates: [-73.9822, 40.7532],
    description: 'Historic library providing quiet study spaces, cultural programs, and community resources.',
    features: ['Reading rooms', 'Study spaces', 'Cultural events', 'Free WiFi', 'Community programs']
  },
  {
    name: 'Chelsea Recreation Center',
    category: 'fitness',
    coordinates: [-74.0014, 40.7465],
    description: 'Community fitness center offering exercise equipment, classes, and wellness programs.',
    features: ['Gym equipment', 'Group classes', 'Swimming pool', 'Sports courts', 'Wellness programs']
  }
]
