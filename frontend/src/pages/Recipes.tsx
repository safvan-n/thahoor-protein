import { motion } from 'framer-motion';

const RECIPES = [
    {
        id: '1',
        title: 'Simple & Easy Chicken Curry',
        description: 'Easy Kerala style chicken curry for beginners.',
        videoId: 'JsZKu2L6eAc'
    },
    {
        id: '2',
        title: 'Kerala Style Fish Curry',
        description: 'Authentic Meen Mulakittathu preparation.',
        videoId: 'BKXCwWqS12s'
    },
    {
        id: '3',
        title: 'Mutton Curry Recipe',
        description: 'Kerala style easy mutton curry.',
        videoId: '6MjvNkKAwKo'
    },
    {
        id: '4',
        title: 'Beef Liver Pepper Fry',
        description: 'Yummy cooking beef liver pepper fry.',
        videoId: 'CeMXg6EhaQU'
    },
    {
        id: '5',
        title: 'Beef Curry - Kerala Style',
        description: 'Perfect side dish for Rice, Chappathi & Porotta.',
        videoId: 'TAzGfMkU0K0'
    }
];

export function Recipes() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="font-display text-5xl font-bold text-gray-900 mb-4">How To Cook It</h1>
                    <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mb-6"></div>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Explore our collection of authentic Malayalam recipes. Learn to make delicious dishes with our premium meat cuts.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {RECIPES.map((recipe, index) => (
                        <motion.div
                            key={recipe.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
                        >
                            {/* Video Embed */}
                            <div className="relative pt-[56.25%] bg-black">
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full"
                                    src={`https://www.youtube.com/embed/${recipe.videoId}?rel=0`}
                                    title={recipe.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>

                            <div className="p-6">
                                <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
                                    {recipe.title}
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    {recipe.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-400 text-sm italic">
                        More recipes coming soon!
                    </p>
                </div>
            </div>
        </div>
    );
}
