"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, User, LogOut, Moon, Sun, Globe, Camera } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  const navLinks = [
    { name: t("home"), path: "/" },
    { name: t("search"), path: "/items" },
    { name: t("report"), path: "/report" },
    { name: t("qrStore"), path: "/qr-store" },
    { name: t("contact"), path: "/contact" },
    { name: t("dashboard"), path: "/dashboard" },
  ]

  const handleSignOut = async () => {
    await signOut()
    setIsUserMenuOpen(false)
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "fr" : "en"
    i18n.changeLanguage(newLang)
    localStorage.setItem("language", newLang)
  }

  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div whileHover={{ scale: 1.05 }} className="text-2xl font-bold gradient-text">
              Obli
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 ">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-6 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}

            <div className="flex items-center gap-2">
              <button
                onClick={()=>navigate('/scan')}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {/* {theme === "light" ? <Moon size={18} /> : <Sun size={18} />} */}
                <Camera size={18} className="text-primary"/>
              </button>

              <button
                onClick={toggleLanguage}
                className="p-2 rounded-lg hover:bg-muted transition-colors flex items-center gap-1"
                aria-label="Toggle language"
              >
                <Globe size={18} />
                <span className="text-xs font-semibold uppercase">{i18n.language}</span>
              </button>
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 glass rounded-xl hover:bg-muted transition-colors"
                >
                  <User size={18} />
                  <span className="text-sm">{user.email?.split("@")[0]}</span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 glass rounded-xl border border-border overflow-hidden"
                    >
                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-3 hover:bg-muted transition-colors text-sm"
                      >
                        {t("dashboard")}
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 hover:bg-destructive/20 transition-colors text-sm text-destructive flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        {t("signOut")}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/auth">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                  {t("signIn")}
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === link.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="flex items-center gap-2 px-4 py-2">
                <button
                  onClick={()=>navigate('/scan')}
                  className="flex-1 p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
                >
                  {/* {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                  <span className="text-sm">{theme === "light" ? "Dark" : "Light"}</span> */}
                  <Camera size={18} className="text-primary"/>
                </button>

                <button
                  onClick={toggleLanguage}
                  className="flex-1 p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
                >
                  <Globe size={18} />
                  <span className="text-sm uppercase">{i18n.language === "en" ? "FR" : "EN"}</span>
                </button>
              </div>

              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-muted-foreground border-t border-border">{user.email}</div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 rounded-lg text-destructive hover:bg-destructive/20 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    {t("signOut")}
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                    {t("signIn")}
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
