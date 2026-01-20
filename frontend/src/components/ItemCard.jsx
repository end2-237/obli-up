// frontend/src/components/ItemCard.jsx
import { motion } from "framer-motion";
import { Calendar, MapPin, Tag, CheckCircle, ArrowRight, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import ShareButtons from './ShareButtons'; 

export default function ItemCard({ item, index, viewMode = "grid" }) {
  const isReturned = item.status === "claimed";

  const getItemBadge = () => {
    if (isReturned) {
      return {
        label: "✓ Retrouvé",
        className: "bg-green-500 text-white",
      };
    }
    return {
      label: item.type === "lost" ? "Perdu" : "Trouvé",
      className:
        item.type === "lost"
          ? "bg-destructive/20 text-destructive"
          : "bg-secondary/20 text-secondary",
    };
  };

  const badge = getItemBadge();

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.01 }}
        className={`glass rounded-xl overflow-hidden hover:border-primary/50 transition-all ${
          isReturned ? "opacity-75" : ""
        }`}
      >
        <Link to={`/items/${item.id}`}>
          <div className="flex gap-4 p-4">
            <div className="relative w-32 h-32 flex-shrink-0">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                className={`w-full h-full object-cover rounded-lg ${
                  isReturned ? "grayscale" : ""
                }`}
              />
              {isReturned && (
                <div className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold line-clamp-1">
                  {item.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {item.description}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Tag size={14} />
                  <span>{item.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span className="line-clamp-1">{item.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{new Date(item.date).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className={`glass rounded-2xl overflow-hidden hover:border-primary/50 transition-all ${
        isReturned ? "opacity-75" : ""
      }`}
    >
      {item.status !== "claimed" ? (
        <Link to={`/items/${item.id}`}>
          <div className="relative h-48 overflow-hidden">
            <img
              src={item.image || "/placeholder.svg"}
              alt={item.title}
              className={`w-full h-full object-cover transition-transform duration-300 hover:scale-110 ${
                isReturned ? "grayscale" : ""
              }`}
            />
            {isReturned && (
              <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                <div className="bg-white rounded-full p-3">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
              </div>
            )}
            <div className="absolute top-4 right-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${badge.className}`}
              >
                {badge.label}
              </span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 line-clamp-1">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {item.description}
            </p>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Tag size={14} />
                <span>{item.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span className="line-clamp-1">{item.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{new Date(item.date).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>

            {item.status !== "claimed" && (
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Ouvrir un modal avec ShareButtons
                  }}
                  className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <Share2 size={16} />
                  
                </button>
                <span className="text-sm text-primary font-semibold">
                  Voir les détails
                </span>
                <ArrowRight
                  className="text-primary group-hover:translate-x-1 transition-transform"
                  size={18}
                />
              </div>
            )}
          </div>
        </Link>
      ) : (
        <div className="div">
          <div className="relative h-48 overflow-hidden">
            <img
              src={item.image || "/placeholder.svg"}
              alt={item.title}
              className={`w-full h-full object-cover transition-transform duration-300 hover:scale-110 ${
                isReturned ? "grayscale" : ""
              }`}
            />
            {isReturned && (
              <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                <div className="bg-white rounded-full p-3">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
              </div>
            )}
            <div className="absolute top-4 right-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${badge.className}`}
              >
                {badge.label}
              </span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 line-clamp-1">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {item.description}
            </p>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Tag size={14} />
                <span>{item.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span className="line-clamp-1">{item.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{new Date(item.date).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>

            {item.status !== "claimed" && (
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-sm text-primary font-semibold">
                  Voir les détails
                </span>
                <ArrowRight
                  className="text-primary group-hover:translate-x-1 transition-transform"
                  size={18}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
