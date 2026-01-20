// frontend/src/pages/HomePage.jsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search,
  Upload,
  Shield,
  ArrowRight,
  Sparkles,
  QrCode,
  MessageSquare,
  Check,
  Loader2,
  Users,
  Package,
  TrendingUp,
  Award,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import AnimatedBackground from "../components/AnimatedBackground";
import ItemCard from "../components/ItemCard";
import AnimatedCounter from "../components/AnimatedCounter";
import { itemService } from "../services/itemService";
import { statsService } from "../services/statsService";

// ✅ Configuration : activer/désactiver les sections
const SHOW_STATS_SECTION = false; // Mettre à false pour cacher la section stats
const SHOW_APP_SECTION = true; // Mettre à false pour cacher la section app mobile

export default function HomePage() {
  const { t } = useTranslation();
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    totalItems: 0,
    returnedItems: 0,
    messages: 0,
    successRate: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadRecentItems();
    if (SHOW_STATS_SECTION) {
      loadStats();
    }
  }, []);

  const loadRecentItems = async () => {
    try {
      setLoading(true);
      const items = await itemService.getAllItems({});
      setRecentItems(items.slice(0, 3));
    } catch (error) {
      console.error("Erreur lors du chargement des items:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const platformStats = await statsService.getPlatformStats();
      setStats(platformStats);
    } catch (error) {
      console.error("Erreur chargement statistiques:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const features = [
    {
      icon: Upload,
      title: "Déclarez Facilement",
      description:
        "Signalez vos objets perdus en quelques clics avec notre interface intuitive",
    },
    {
      icon: QrCode,
      title: "QR Codes Intelligents",
      description:
        "Protégez vos objets avec des autocollants QR qui envoient des notifications instantanées",
    },
    {
      icon: MessageSquare,
      title: "Chat en Temps Réel",
      description:
        "Communiquez directement avec les trouveurs ou propriétaires",
    },
    {
      icon: Shield,
      title: "Sécurisé & Privé",
      description:
        "Vos données sont protégées avec les dernières technologies de sécurité",
    },
  ];

  const platformStats = [
    {
      icon: Users,
      value: stats.users,
      label: "Utilisateurs nous font confiance",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Package,
      value: stats.totalItems,
      label: "Objets déclarés",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      icon: Award,
      value: stats.returnedItems,
      label: "Objets retrouvés",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: TrendingUp,
      value: stats.successRate,
      label: "Taux de réussite",
      suffix: "%",
      color: "text-green-600",
      bgColor: "bg-green-600/10",
    },
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <AnimatedBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm"
            >
              <Sparkles size={16} className="text-primary" />
              <span className="text-muted-foreground">{t("heroPreTitle")}</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance">
              {t("heroTitle")}
              <br />
              <span className="gradient-text">{t("heroSubtitle")}</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              {t("heroDescription")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/report">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold glow-primary hover:bg-primary/90 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  {t("report")}
                  <ArrowRight size={20} />
                </motion.button>
              </Link>

              <Link to="/items">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 glass rounded-xl font-semibold hover:bg-muted transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <Search size={20} />
                  {t("search")}
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-muted rounded-full flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 bg-primary rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      {SHOW_STATS_SECTION && (
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ils Nous Font Confiance
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Rejoignez une communauté qui s'entraide pour retrouver les objets perdus
              </p>
            </motion.div>

            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={48} />
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {platformStats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="glass rounded-2xl p-6 text-center hover:border-primary/50 transition-all"
                  >
                    <div className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <stat.icon className={stat.color} size={32} />
                    </div>
                    <div className="text-4xl font-bold mb-2 gradient-text">
                      <AnimatedCounter 
                        value={stat.value} 
                        suffix={stat.suffix || ""}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Recent Items Section */}
      {recentItems.length > 0 && (
        <section className="py-24 bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Objets Récemment Déclarés
              </h2>
              <p className="text-muted-foreground">
                Les derniers objets perdus et trouvés sur la plateforme
              </p>
            </motion.div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={48} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {recentItems.map((item, index) => (
                  <ItemCard key={item.id} item={item} index={index} viewMode="grid" />
                ))}
              </div>
            )}

            <div className="text-center">
              <Link to="/items">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                >
                  Voir tous les objets
                  <ArrowRight size={20} />
                </motion.button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Mission Section */}
      <section className="py-24 bg-card/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              {t("missionTitle")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("missionDescription")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("features")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("featuresDescription")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="glass rounded-2xl p-6 hover:border-primary/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Download Section - COMING SOON */}
      {SHOW_APP_SECTION && (
        <section className="py-24 bg-card/50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 text-sm border-2 border-primary/30">
                  <Sparkles size={16} className="text-primary animate-pulse" />
                  <span className="text-primary font-semibold">Bientôt Disponible</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                  {t("downloadApp")}
                  <br />
                  <span className="gradient-text">{t("goMobile")}</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {t("appDescription")}
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check size={20} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">
                        {t("instantNotifications")}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t("instantNotificationsDesc")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check size={20} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{t("qrScanner")}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t("qrScannerDesc")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check size={20} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{t("offlineMode")}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t("offlineModeDesc")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Boutons désactivés avec badge Coming Soon */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="px-6 py-3 glass rounded-xl opacity-50 cursor-not-allowed flex items-center justify-center gap-3 border border-border"
                    >
                      <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                      </svg>
                      <div className="text-left">
                        <div className="text-xs text-muted-foreground">
                          {t("downloadOn")}
                        </div>
                        <div className="font-semibold">App Store</div>
                      </div>
                    </motion.div>
                    <span className="absolute -top-2 -right-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                      Bientôt
                    </span>
                  </div>

                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="px-6 py-3 glass rounded-xl opacity-50 cursor-not-allowed flex items-center justify-center gap-3 border border-border"
                    >
                      <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                      </svg>
                      <div className="text-left">
                        <div className="text-xs text-muted-foreground">
                          {t("getItOn")}
                        </div>
                        <div className="font-semibold">Google Play</div>
                      </div>
                    </motion.div>
                    <span className="absolute -top-2 -right-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                      Bientôt
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="relative mx-auto w-full max-w-sm">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl" />
                    <div className="relative glass rounded-[3rem] p-3 border-8 border-foreground/10">
                      <div className="bg-background rounded-[2.5rem] overflow-hidden">
                        <div className="bg-background h-8 flex justify-center">
                          <div className="w-32 h-6 bg-foreground/10 rounded-b-3xl" />
                        </div>
                        <div className="px-4 pb-4">
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-2xl font-bold">Obli</div>
                              <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/20" />
                                <div className="w-8 h-8 rounded-full bg-primary/20" />
                              </div>
                            </div>
                            <div className="glass rounded-xl p-3 text-sm">
                              <Search size={16} className="inline mr-2" />
                              {t("searchYourItem")}
                            </div>
                          </div>
                          <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="glass rounded-xl p-3 flex gap-3"
                              >
                                <div className="w-16 h-16 bg-primary/20 rounded-lg flex-shrink-0" />
                                <div className="flex-1 space-y-1">
                                  <div className="h-3 bg-foreground/20 rounded w-3/4" />
                                  <div className="h-2 bg-foreground/10 rounded w-1/2" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white shadow-xl rounded-2xl p-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">
              {t("ctaTitle")}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t("ctaDescription")}
            </p>

            <Link to="/report">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                {t("ctaButton")}
              </motion.button>
            </Link>
          </motion.div>
        </div>

        <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl"></div>
      </section>
    </div>
  );
}