"use client"

import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { MapPin, Calendar, Tag, ArrowRight } from "lucide-react"

export default function ItemCard({ item, index, viewMode }) {
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="glass rounded-xl p-4 hover:border-primary/50 transition-all"
      >
        <Link to={`/items/${item.id}`} className="flex flex-col sm:flex-row gap-4">
          <img
            src={item.image || "/placeholder.svg"}
            alt={item.title}
            className="w-full sm:w-32 h-32 object-cover rounded-lg"
            crossOrigin="anonymous"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  item.status === "lost" ? "bg-destructive/20 text-destructive" : "bg-secondary/20 text-secondary"
                }`}
              >
                {item.status === "lost" ? "Perdu" : "Trouvé"}
              </span>
            </div>
            <p className="text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Tag size={16} />
                <span>{item.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>{item.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{new Date(item.date).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <ArrowRight className="text-primary" size={20} />
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="glass rounded-xl overflow-hidden hover:border-primary/50 transition-all group"
    >
      <Link to={`/items/${item.id}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={item.image || "/placeholder.svg"}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            crossOrigin="anonymous"
          />
          <div className="absolute top-3 right-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                item.status === "lost"
                  ? "bg-destructive/80 text-destructive-foreground"
                  : "bg-secondary/80 text-secondary-foreground"
              }`}
            >
              {item.status === "lost" ? "Perdu" : "Trouvé"}
            </span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{item.description}</p>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Tag size={16} />
              <span>{item.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{item.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{new Date(item.date).toLocaleDateString("fr-FR")}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-primary font-semibold">Voir les détails</span>
            <ArrowRight className="text-primary group-hover:translate-x-1 transition-transform" size={18} />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
