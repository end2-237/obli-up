import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"

// Champs de preuve selon la catégorie
const proofFieldsByCategory = {
  "Électronique": [
    { id: "brand", label: "Marque exacte", type: "text", required: true },
    { id: "model", label: "Modèle exact", type: "text", required: true },
    { id: "color", label: "Couleur", type: "text", required: true },
    { id: "screenCondition", label: "État de l'écran", type: "select", options: ["Intact", "Fissures légères", "Très fissuré"], required: true },
    { id: "caseColor", label: "Couleur de la coque (si présente)", type: "text", required: false },
    { id: "wallpaper", label: "Description du fond d'écran", type: "textarea", required: false },
    { id: "uniqueMarks", label: "Marques ou autocollants distinctifs", type: "textarea", required: false }
  ],
  "Bagagerie": [
    { id: "type", label: "Type de sac", type: "select", options: ["Sac à dos", "Sac à main", "Valise", "Sacoche"], required: true },
    { id: "brand", label: "Marque (si visible)", type: "text", required: false },
    { id: "color", label: "Couleur principale", type: "text", required: true },
    { id: "material", label: "Matière", type: "select", options: ["Cuir", "Tissu", "Synthétique", "Autre"], required: true },
    { id: "pockets", label: "Nombre de poches", type: "number", required: true },
    { id: "contents", label: "Contenu du sac (liste privée)", type: "textarea", required: true, private: true },
    { id: "defects", label: "Défauts visibles (déchirures, taches)", type: "textarea", required: false }
  ],
  "Clés": [
    { id: "keyType", label: "Type de clés", type: "select", options: ["Maison", "Voiture", "Bureau", "Cadenas"], required: true },
    { id: "keyCount", label: "Nombre de clés sur le trousseau", type: "number", required: true },
    { id: "keychain", label: "Description du porte-clés", type: "textarea", required: false },
    { id: "carBrand", label: "Marque de voiture (si applicable)", type: "text", required: false },
    { id: "attachedCards", label: "Cartes ou badges attachés", type: "textarea", required: false },
    { id: "uniqueFeatures", label: "Caractéristiques uniques", type: "textarea", required: true, private: true }
  ],
  "Accessoires": [
    { id: "type", label: "Type d'accessoire", type: "text", required: true },
    { id: "brand", label: "Marque", type: "text", required: false },
    { id: "color", label: "Couleur", type: "text", required: true },
    { id: "material", label: "Matière", type: "text", required: true },
    { id: "initials", label: "Initiales ou gravure", type: "text", required: false, private: true },
    { id: "defects", label: "Défauts ou marques uniques", type: "textarea", required: false }
  ],
  "Documents": [
    { id: "docType", label: "Type de document", type: "select", options: ["Carte d'identité", "Passeport", "Permis", "Carte vitale", "Autre"], required: true },
    { id: "country", label: "Pays émetteur", type: "text", required: true },
    { id: "condition", label: "État du document", type: "select", options: ["Neuf", "Bon état", "Usagé", "Abîmé"], required: true },
    { id: "envelope", label: "Dans une enveloppe/étui", type: "select", options: ["Oui", "Non"], required: false }
  ]
}

export default function SecureReportForm() {
  const [category, setCategory] = useState("")
  const [proofFields, setProofFields] = useState({})
  const [showPrivateFields, setShowPrivateFields] = useState(false)

  const handleCategoryChange = (selectedCategory) => {
    setCategory(selectedCategory)
    // Réinitialiser les champs de preuve
    const fields = {}
    proofFieldsByCategory[selectedCategory]?.forEach(field => {
      fields[field.id] = ""
    })
    setProofFields(fields)
  }

  const handleProofFieldChange = (fieldId, value) => {
    setProofFields(prev => ({ ...prev, [fieldId]: value }))
  }

  const renderProofField = (field) => {
    const isPrivate = field.private
    
    return (
      <div key={field.id} className="relative">
        <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
          {field.label}
          {field.required && <span className="text-destructive">*</span>}
          {isPrivate && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
              <Lock size={12} />
              Privé
            </span>
          )}
        </label>
        
        {field.type === "text" && (
          <input
            type="text"
            value={proofFields[field.id] || ""}
            onChange={(e) => handleProofFieldChange(field.id, e.target.value)}
            required={field.required}
            className={`w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
              isPrivate && !showPrivateFields ? "filter blur-sm" : ""
            }`}
            disabled={isPrivate && !showPrivateFields}
          />
        )}
        
        {field.type === "number" && (
          <input
            type="number"
            value={proofFields[field.id] || ""}
            onChange={(e) => handleProofFieldChange(field.id, e.target.value)}
            required={field.required}
            min="0"
            className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}
        
        {field.type === "select" && (
          <select
            value={proofFields[field.id] || ""}
            onChange={(e) => handleProofFieldChange(field.id, e.target.value)}
            required={field.required}
            className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Sélectionnez...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )}
        
        {field.type === "textarea" && (
          <textarea
            value={proofFields[field.id] || ""}
            onChange={(e) => handleProofFieldChange(field.id, e.target.value)}
            required={field.required}
            rows={3}
            className={`w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
              isPrivate && !showPrivateFields ? "filter blur-sm" : ""
            }`}
            disabled={isPrivate && !showPrivateFields}
          />
        )}
        
        {isPrivate && !showPrivateFields && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
            <Lock className="text-muted-foreground" size={24} />
          </div>
        )}
      </div>
    )
  }

  const categories = ["Électronique", "Bagagerie", "Clés", "Accessoires", "Documents"]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="text-primary" size={32} />
          <div>
            <h2 className="text-2xl font-bold">Signalement Sécurisé</h2>
            <p className="text-sm text-muted-foreground">
              Les informations privées ne seront visibles que par vous et le réclamant après vérification
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Sélection de catégorie */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Catégorie de l'objet</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-3 rounded-xl transition-all ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Champs de preuve */}
        <AnimatePresence>
          {category && proofFieldsByCategory[category] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Shield className="text-primary" size={24} />
                  Informations de Vérification
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPrivateFields(!showPrivateFields)}
                  className="px-4 py-2 glass rounded-lg hover:bg-muted transition-colors flex items-center gap-2 text-sm"
                >
                  {showPrivateFields ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showPrivateFields ? "Masquer" : "Afficher"} les champs privés
                </button>
              </div>

              <div className="mb-6 p-4 bg-accent/10 border border-accent rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-accent flex-shrink-0 mt-0.5" size={20} />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Comment ça fonctionne ?</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Les champs marqués <Lock size={12} className="inline" /> sont <strong>privés</strong> et ne seront jamais affichés publiquement</li>
                      <li>• Le réclamant devra répondre aux mêmes questions avant de payer</li>
                      <li>• Un score de correspondance sera calculé automatiquement</li>
                      <li>• Le paiement ne sera autorisé qu'avec un score suffisant (&gt;80%)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {proofFieldsByCategory[category].map(field => renderProofField(field))}
              </div>

              <div className="mt-6 p-4 bg-secondary/10 border border-secondary rounded-xl">
                <div className="flex items-center gap-2 text-secondary mb-2">
                  <CheckCircle size={20} />
                  <span className="font-semibold">Sécurité renforcée</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ces informations permettront de vérifier l'identité du propriétaire légitime sans révéler
                  vos données personnelles publiquement.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}