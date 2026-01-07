// frontend/src/pages/ReportItemPage.jsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  MapPin,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { itemService } from "../services/itemService";
import SecureProofFields from "../components/SecureProofFields";

const categories = [
  "Électronique",
  "Bagagerie",
  "Clés",
  "Accessoires",
  "Vêtements",
  "Documents",
  "Autre",
];

const steps = [
  { id: 1, title: "Type d'objet", description: "Informations de base" },
  { id: 2, title: "Description", description: "Détails importants" },
  { id: 3, title: "Localisation", description: "Où et quand" },
  { id: 4, title: "Photos", description: "Images de l'objet" },
];

export default function ReportItemPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasReviewedImagesStep, setHasReviewedImagesStep] = useState(false);

  const [formData, setFormData] = useState({
    type: "lost",
    title: "",
    category: "",
    description: "",
    location: "",
    date: "",
    images: [],
    proofData: {},
    proofFieldsConfig: [],
  });
  const [previewImages, setPreviewImages] = useState([]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviews]);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep !== steps.length) {
      return;
    }

    if (!user) {
      alert("Vous devez être connecté pour déclarer un objet");
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);

      // 1. Créer l'item
      const newItem = await itemService.createItem(formData, user.id);

      // 2. Upload des images si présentes
      if (formData.images.length > 0) {
        await itemService.uploadImages(newItem.id, formData.images);
        navigate("/dashboard");
      }

      // Succès
      alert("✅ Objet déclaré avec succès !");
      
    } catch (error) {
      console.error("Erreur lors de la déclaration:", error);
      alert("❌ Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.category;
      case 2:
        return formData.description.length >= 20;
      case 3:
        return formData.location && formData.date;
      case 4:
        return formData.images.length > 0;

      // case 4:
      //   return hasReviewedImagesStep;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Déclarer un Objet
            </h1>
            <p className="text-lg text-muted-foreground">
              Aidez-nous à retrouver ou restituer cet objet
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep > step.id
                        ? "bg-primary text-primary-foreground"
                        : currentStep === step.id
                        ? "bg-primary text-primary-foreground glow-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? <Check size={20} /> : step.id}
                  </div>
                  <div className="mt-2 text-center hidden sm:block">
                    <div className="text-sm font-semibold">{step.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 transition-colors ${
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {/* Step 1: Type d'objet */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="glass rounded-2xl p-6">
                  <h2 className="text-2xl font-bold mb-6">
                    Type de déclaration
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => handleInputChange("type", "lost")}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        formData.type === "lost"
                          ? "border-destructive bg-destructive/10"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div className="text-2xl mb-2">😢</div>
                      <div className="font-semibold mb-1">
                        J'ai perdu un objet
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Déclarer un objet que vous avez perdu
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInputChange("type", "found")}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        formData.type === "found"
                          ? "border-secondary bg-secondary/10"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div className="text-2xl mb-2">🎉</div>
                      <div className="font-semibold mb-1">
                        J'ai trouvé un objet
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Signaler un objet que vous avez trouvé
                      </div>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Nom de l'objet *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        placeholder="Ex: iPhone 14 Pro, Sac à dos noir..."
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Catégorie *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {categories.map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() =>
                              handleInputChange("category", category)
                            }
                            className={`px-4 py-3 rounded-xl transition-all ${
                              formData.category === category
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
                </div>
              </motion.div>
            )}

            {/* Step 2: Description */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass rounded-2xl p-6"
              >
                <h2 className="text-2xl font-bold mb-6">
                  Description détaillée
                </h2>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Décrivez l'objet en détail * (minimum 20 caractères)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={8}
                    placeholder="Décrivez l'objet avec le maximum de détails : couleur, marque, signes distinctifs, état..."
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                    required
                  />
                  <div className="mt-2 text-sm text-muted-foreground">
                    {formData.description.length} / 20 caractères minimum
                  </div>

                  <div className="mt-6">
                    <SecureProofFields
                      category={formData.category}
                      onProofDataChange={(proofData, config) => {
                        setFormData((prev) => ({
                          ...prev,
                          proofData,
                          proofFieldsConfig: config,
                        }));
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Localisation */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass rounded-2xl p-6"
              >
                <h2 className="text-2xl font-bold mb-6">Où et quand ?</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      <MapPin className="inline mr-2" size={16} />
                      Lieu *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="Ex: Paris 15ème - Métro Dupleix"
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      required
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Soyez aussi précis que possible pour faciliter la
                      recherche
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      <Calendar className="inline mr-2" size={16} />
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        handleInputChange("date", e.target.value)
                      }
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Photos */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass rounded-2xl p-6"
              >
                <h2 className="text-2xl font-bold mb-6">Photos (optionnel)</h2>

                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload
                        className="mx-auto mb-4 text-muted-foreground"
                        size={48}
                      />
                      <p className="text-lg font-semibold mb-2">
                        Ajouter des photos
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Glissez-déposez ou cliquez pour sélectionner
                      </p>
                    </label>
                  </div>

                  {previewImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {previewImages.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      {/* <button
                        type="button"
                        onClick={() => setHasReviewedImagesStep(true)}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Continuer sans ajouter d’autres photos
                      </button> */}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
              className="px-6 py-3 glass rounded-xl hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Précédent
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid() || loading}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 glow-primary"
              >
                Suivant
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 glow-secondary"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Publication...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Publier la déclaration
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
