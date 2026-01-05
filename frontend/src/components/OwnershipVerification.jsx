import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, AlertTriangle, CheckCircle, XCircle, Lock, CreditCard, MessageSquare } from "lucide-react"

export default function OwnershipVerification({ item, onVerificationComplete }) {
  const [step, setStep] = useState("intro") // intro, verification, result, payment
  const [answers, setAnswers] = useState({})
  const [verificationScore, setVerificationScore] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  // Simulation des champs de vérification basés sur la catégorie
  const verificationFields = {
    "Électronique": [
      { id: "brand", label: "Quelle est la marque exacte ?", type: "text", weight: 15 },
      { id: "model", label: "Quel est le modèle exact ?", type: "text", weight: 15 },
      { id: "color", label: "Quelle est la couleur ?", type: "text", weight: 10 },
      { id: "screenCondition", label: "Quel est l'état de l'écran ?", type: "select", options: ["Intact", "Fissures légères", "Très fissuré"], weight: 10 },
      { id: "caseColor", label: "De quelle couleur est la coque ?", type: "text", weight: 10 },
      { id: "wallpaper", label: "Décrivez le fond d'écran", type: "textarea", weight: 20 },
      { id: "uniqueMarks", label: "Y a-t-il des autocollants ou marques distinctives ? Lesquels ?", type: "textarea", weight: 20 }
    ]
  }

  const currentFields = verificationFields[item.category] || []

  const handleAnswerChange = (fieldId, value) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }))
  }

  const calculateScore = () => {
    // Simulation du calcul de score
    // En production, cela serait fait côté serveur avec les vraies réponses
    let totalScore = 0
    let maxScore = 0

    currentFields.forEach(field => {
      maxScore += field.weight
      const userAnswer = answers[field.id]?.toLowerCase().trim()
      const correctAnswer = item.proofData?.[field.id]?.toLowerCase().trim()

      if (userAnswer && correctAnswer) {
        // Calcul de similarité (simplifié ici)
        if (userAnswer === correctAnswer) {
          totalScore += field.weight
        } else if (userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer)) {
          totalScore += field.weight * 0.7 // 70% de points pour correspondance partielle
        }
      }
    })

    return Math.round((totalScore / maxScore) * 100)
  }

  const handleSubmitVerification = () => {
    setIsProcessing(true)
    
    // Simulation de la vérification
    setTimeout(() => {
      const score = calculateScore()
      setVerificationScore(score)
      setIsProcessing(false)
      setStep("result")
    }, 2000)
  }

  const handlePayment = () => {
    setIsProcessing(true)
    
    // Simulation du paiement
    setTimeout(() => {
      setIsProcessing(false)
      onVerificationComplete?.(true, verificationScore)
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto mt-30 p-6">
      <AnimatePresence mode="wait">
        {/* Étape 1: Introduction */}
        {step === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="glass rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-primary" size={40} />
              </div>
              
              <h2 className="text-3xl font-bold mb-4">Vérification de Propriété</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Avant d'accéder aux détails complets, nous devons vérifier que vous êtes bien le propriétaire de cet objet.
              </p>

              <div className="bg-accent/10 border border-accent rounded-xl p-6 text-left mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="text-accent" size={20} />
                  Comment ça fonctionne ?
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">1.</span>
                    <span>Répondez aux questions de vérification sur l'objet trouvé</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">2.</span>
                    <span>Vos réponses seront comparées avec celles du trouveur</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">3.</span>
                    <span>Un score de correspondance sera calculé</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">4.</span>
                    <span>Le paiement sera autorisé uniquement si le score dépasse 80%</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-muted rounded-xl">
                  <div className="text-2xl font-bold text-primary mb-1">Gratuit</div>
                  <div className="text-sm text-muted-foreground">Tentative de vérification</div>
                </div>
                <div className="p-4 bg-muted rounded-xl">
                  <div className="text-2xl font-bold text-primary mb-1">80%</div>
                  <div className="text-sm text-muted-foreground">Score minimum requis</div>
                </div>
                <div className="p-4 bg-muted rounded-xl">
                  <div className="text-2xl font-bold text-primary mb-1">500 FCFA</div>
                  <div className="text-sm text-muted-foreground">Après validation</div>
                </div>
              </div>

              <button
                onClick={() => setStep("verification")}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Commencer la Vérification
              </button>
            </div>
          </motion.div>
        )}

        {/* Étape 2: Questions de vérification */}
        {step === "verification" && (
          <motion.div
            key="verification"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 mt-220"
          >
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="text-primary" size={24} />
                <div>
                  <h2 className="text-2xl font-bold">Questions de Vérification</h2>
                  <p className="text-sm text-muted-foreground">
                    Répondez avec le maximum de précision pour prouver votre propriété
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {currentFields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-primary font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <label className="block font-semibold mb-2">{field.label}</label>
                        
                        {field.type === "text" && (
                          <input
                            type="text"
                            value={answers[field.id] || ""}
                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                            className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Votre réponse..."
                          />
                        )}
                        
                        {field.type === "select" && (
                          <select
                            value={answers[field.id] || ""}
                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
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
                            value={answers[field.id] || ""}
                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            placeholder="Décrivez en détail..."
                          />
                        )}
                        
                        <div className="mt-2 text-xs text-muted-foreground">
                          Poids dans la vérification: {field.weight}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setStep("intro")}
                  className="px-6 py-3 glass rounded-xl hover:bg-muted transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={handleSubmitVerification}
                  disabled={isProcessing || Object.keys(answers).length < currentFields.length}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                      />
                      Vérification en cours...
                    </>
                  ) : (
                    <>Vérifier mes Réponses</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Étape 3: Résultat de la vérification */}
        {step === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-6"
          >
            <div className={`glass rounded-2xl p-8 text-center ${
              verificationScore >= 80 ? "border-2 border-secondary" : "border-2 border-destructive"
            }`}>
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                verificationScore >= 80 ? "bg-secondary/10" : "bg-destructive/10"
              }`}>
                {verificationScore >= 80 ? (
                  <CheckCircle className="text-secondary" size={48} />
                ) : (
                  <XCircle className="text-destructive" size={48} />
                )}
              </div>

              <h2 className="text-3xl font-bold mb-4">
                {verificationScore >= 80 ? "Vérification Réussie !" : "Vérification Échouée"}
              </h2>

              <div className="mb-6">
                <div className="text-6xl font-bold mb-2" style={{
                  background: verificationScore >= 80 
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}>
                  {verificationScore}%
                </div>
                <p className="text-muted-foreground">Score de correspondance</p>
              </div>

              {verificationScore >= 80 ? (
                <>
                  <p className="text-lg text-muted-foreground mb-8">
                    Vos réponses correspondent bien aux informations du trouveur.
                    Vous pouvez maintenant procéder au paiement pour accéder aux détails complets et contacter le trouveur.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-secondary/10 rounded-xl">
                      <MessageSquare className="mx-auto mb-2 text-secondary" size={24} />
                      <div className="text-sm font-semibold">Chat Direct</div>
                      <div className="text-xs text-muted-foreground mt-1">Messagerie instantanée</div>
                    </div>
                    <div className="p-4 bg-secondary/10 rounded-xl">
                      <Lock className="mx-auto mb-2 text-secondary" size={24} />
                      <div className="text-sm font-semibold">Infos Complètes</div>
                      <div className="text-xs text-muted-foreground mt-1">Lieu, date, photos</div>
                    </div>
                    <div className="p-4 bg-secondary/10 rounded-xl">
                      <Shield className="mx-auto mb-2 text-secondary" size={24} />
                      <div className="text-sm font-semibold">Paiement Sécurisé</div>
                      <div className="text-xs text-muted-foreground mt-1">500 FCFA unique</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep("payment")}
                    className="px-8 py-4 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    <CreditCard size={20} />
                    Procéder au Paiement (500 FCFA)
                  </button>
                </>
              ) : (
                <>
                  <p className="text-lg text-muted-foreground mb-8">
                    Vos réponses ne correspondent pas suffisamment. Score minimum requis: 80%
                  </p>

                  <div className="bg-destructive/10 border border-destructive rounded-xl p-6 mb-8">
                    <h3 className="font-semibold text-destructive mb-2">Que faire maintenant ?</h3>
                    <ul className="text-sm text-muted-foreground text-left space-y-2">
                      <li>• Vérifiez bien que c'est votre objet</li>
                      <li>• Réessayez avec des réponses plus précises</li>
                      <li>• Si vous êtes sûr, contactez le support avec des preuves supplémentaires</li>
                    </ul>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => {
                        setStep("verification")
                        setAnswers({})
                      }}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Réessayer
                    </button>
                    <button
                      onClick={() => setStep("intro")}
                      className="px-6 py-3 glass rounded-xl hover:bg-muted transition-colors"
                    >
                      Retour
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Étape 4: Paiement */}
        {step === "payment" && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="glass rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Finaliser le Paiement</h2>
              
              <div className="bg-muted/50 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Accès aux détails complets</span>
                  <span className="text-2xl font-bold text-primary">500 FCFA</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle size={16} className="text-secondary" />
                    <span>Score de vérification: {verificationScore}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle size={16} className="text-secondary" />
                    <span>Messagerie instantanée avec le trouveur</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle size={16} className="text-secondary" />
                    <span>Coordonnées complètes et lieu exact</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full px-6 py-4 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-secondary-foreground border-t-transparent rounded-full"
                    />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Payer 500 FCFA
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// // Exemple d'utilisation
// const mockItem = {
//   id: 1,
//   title: "iPhone 14 Pro",
//   category: "Électronique",
//   proofData: {
//     brand: "Apple",
//     model: "iPhone 14 Pro",
//     color: "Noir",
//     screenCondition: "Intact",
//     caseColor: "Bleu",
//     wallpaper: "Photo de montagne",
//     uniqueMarks: "Autocollant Pokemon à l'arrière"
//   }
// }

// // Render
// function App() {
//   return (
//     <OwnershipVerification 
//       item={mockItem}
//       onVerificationComplete={(success, score) => {
//         console.log("Verification complete:", success, score)
//       }}
//     />
//   )
// }

// export default App