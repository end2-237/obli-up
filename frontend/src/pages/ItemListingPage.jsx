"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Grid, List } from "lucide-react"
import ItemCard from "../components/ItemCard"

// Mock data - sera remplacé par Supabase
const mockItems = [
  {
    id: 1,
    title: "iPhone 14 Pro",
    description: "Téléphone noir avec coque bleue",
    category: "Électronique",
    location: "Paris 15ème",
    date: "2025-01-15",
    status: "lost",
    image: "/modern-smartphone.png",
  },
  {
    id: 2,
    title: "Sac à dos Noir",
    description: "Sac Eastpak noir avec porte-clés rouge",
    category: "Bagagerie",
    location: "Lyon Centre",
    date: "2025-01-14",
    status: "found",
    image: "/colorful-backpack-on-wooden-table.png",
  },
  {
    id: 3,
    title: "Clés de voiture",
    description: "Trousseau avec badge Renault",
    category: "Clés",
    location: "Marseille",
    date: "2025-01-13",
    status: "found",
    image: "/car-keys.png",
  },
  {
    id: 4,
    title: "Montre Connectée",
    description: "Apple Watch Series 8 argent",
    category: "Électronique",
    location: "Toulouse",
    date: "2025-01-12",
    status: "lost",
    image: "/apple-watch-lifestyle.png",
  },
  {
    id: 5,
    title: "Portefeuille Cuir",
    description: "Portefeuille marron avec initiales JD",
    category: "Accessoires",
    location: "Bordeaux",
    date: "2025-01-11",
    status: "found",
    image: "/leather-wallet.jpg",
  },
  {
    id: 6,
    title: "Lunettes de Soleil",
    description: "Ray-Ban aviator dorées",
    category: "Accessoires",
    location: "Nice",
    date: "2025-01-10",
    status: "lost",
    image: "/stylish-sunglasses.png",
  },
]

const categories = ["Tous", "Électronique", "Bagagerie", "Clés", "Accessoires", "Vêtements", "Documents"]

export default function ItemListingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [viewMode, setViewMode] = useState("grid")
  const [showFilters, setShowFilters] = useState(false)

  const filteredItems = mockItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "Tous" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Objets Trouvés</h1>
            <p className="text-lg text-muted-foreground">Parcourez notre base de données d'objets perdus et trouvés</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Rechercher un objet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 glass rounded-xl hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Filter size={20} />
                <span className="hidden sm:inline">Filtres</span>
              </button>

              <div className="flex glass rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-xl p-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-3">Catégorie</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          selectedCategory === category
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredItems.length} objet{filteredItems.length > 1 ? "s" : ""} trouvé
            {filteredItems.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Items Grid/List */}
        {filteredItems.length > 0 ? (
          <div
            className={
              viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"
            }
          >
            {filteredItems.map((item, index) => (
              <ItemCard key={item.id} item={item} index={index} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-muted-foreground" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Aucun résultat</h3>
            <p className="text-muted-foreground">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>
    </div>
  )
}
