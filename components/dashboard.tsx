"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Download,
  Github,
  MessageCircle,
  Key,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  Crown,
  Settings,
  Zap,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatTimeRemaining } from "@/lib/utils"
import type { GitHubCommit, KeyGenerationResponse } from "@/lib/types"

export default function Dashboard() {
  const [currentKey, setCurrentKey] = useState<string | null>(null)
  const [keyExpiry, setKeyExpiry] = useState<Date | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0)
  const [commits, setCommits] = useState<GitHubCommit[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [userIP, setUserIP] = useState<string>("unknown")
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info"
    message: string
  } | null>(null)

  useEffect(() => {
    fetchCommits()
    checkOwnerAccess()

    // Check for existing key in localStorage
    const savedKey = localStorage.getItem("executor-key")
    const savedExpiry = localStorage.getItem("executor-key-expiry")

    if (savedKey && savedExpiry) {
      const expiryDate = new Date(savedExpiry)
      if (expiryDate > new Date()) {
        setCurrentKey(savedKey)
        setKeyExpiry(expiryDate)
      } else {
        localStorage.removeItem("executor-key")
        localStorage.removeItem("executor-key-expiry")
      }
    }
  }, [])

  const checkOwnerAccess = async () => {
    try {
      const response = await fetch("/api/owner-check")
      if (response.ok) {
        const data = await response.json()
        setIsOwner(data.isOwner)
        setUserIP(data.ip)

        if (data.isOwner) {
          showNotification("info", "Owner access granted")
        }
      }
    } catch (error) {
      console.error("Failed to check owner access:", error)
    }
  }

  const fetchCommits = async () => {
    try {
      const response = await fetch("/api/commits")
      if (response.ok) {
        const data = await response.json()
        setCommits(data.slice(0, 4)) // Show latest 4 commits for cleaner look
      } else {
        setCommits([
          {
            sha: "fallback1",
            commit: {
              message: "System operational",
              author: {
                name: "System",
                date: new Date().toISOString(),
              },
            },
            html_url: "#",
          },
        ])
      }
    } catch (error) {
      console.error("Failed to fetch commits:", error)
      setCommits([
        {
          sha: "fallback1",
          commit: {
            message: "System operational",
            author: {
              name: "System",
              date: new Date().toISOString(),
            },
          },
          html_url: "#",
        },
      ])
    }
  }

  const generateKey = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/keys/generate", {
        method: "POST",
      })

      const data: KeyGenerationResponse = await response.json()

      if (data.success && data.key) {
        setCurrentKey(data.key)
        const expiry = new Date(data.expiresAt!)
        setKeyExpiry(expiry)

        localStorage.setItem("executor-key", data.key)
        localStorage.setItem("executor-key-expiry", expiry.toISOString())

        showNotification("success", "Key generated successfully")
      } else {
        if (data.cooldownRemaining) {
          setCooldownRemaining(data.cooldownRemaining)
        }
        showNotification("error", data.error || "Generation failed")
      }
    } catch (error) {
      showNotification("error", "Network error")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyKey = () => {
    if (currentKey) {
      navigator.clipboard.writeText(currentKey)
      showNotification("success", "Key copied")
    }
  }

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const downloadExecutor = () => {
    const downloadUrl = "https://github.com/Renetatomm/renetato-s-executor/raw/refs/heads/main/r'se.zip"
    window.open(downloadUrl, "_blank")
    showNotification("success", "Download initiated")
  }

  const getValidationUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/api/validate?key={key}`
    }
    return "https://renetato.vercel.app/api/validate?key={key}"
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Ultra-minimal animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Minimalist Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <Zap className="w-8 h-8 text-purple-400" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-thin tracking-wider text-white">RENETATO</h1>
            {isOwner && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full"
              >
                <Crown className="w-5 h-5 text-yellow-400" />
              </motion.div>
            )}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-400 text-lg font-light tracking-wide"
          >
            EXECUTOR PANEL
          </motion.p>
        </motion.div>

        {/* Floating Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -100, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -100, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-8 right-8 z-50 p-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: notification.type === "success" ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {notification.type === "success" && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {notification.type === "error" && <AlertCircle className="w-5 h-5 text-red-400" />}
                  {notification.type === "info" && <Crown className="w-5 h-5 text-blue-400" />}
                </motion.div>
                <span className="text-white font-medium">{notification.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="xl:col-span-8 space-y-8"
          >
            {/* Key Management - Ultra Minimal */}
            <Card className="bg-gray-900/20 backdrop-blur-xl border-white/5 hover:border-white/10 transition-all duration-500">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Key className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-light text-white">Access Key</h2>
                </div>

                {currentKey ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-violet-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-xl">
                        <code className="text-green-400 font-mono text-lg tracking-wider">{currentKey}</code>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={copyKey}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Copy className="w-5 h-5 text-gray-400" />
                        </motion.button>
                      </div>
                    </div>
                    {keyExpiry && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="font-light">{formatTimeRemaining(keyExpiry)}</span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-center py-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={generateKey}
                      disabled={isGenerating || (cooldownRemaining > 0 && !isOwner)}
                      className="relative px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                      <div className="relative flex items-center gap-3">
                        {isGenerating ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          <Key className="w-5 h-5" />
                        )}
                        <span>Generate Key</span>
                      </div>
                    </motion.button>
                    {cooldownRemaining > 0 && !isOwner && (
                      <p className="text-yellow-400 text-sm mt-4 font-light">Cooldown: {cooldownRemaining}m</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons - Ultra Minimal Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <button
                  onClick={downloadExecutor}
                  className="w-full h-32 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/20 rounded-2xl hover:border-blue-400/40 transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex flex-col items-center justify-center gap-3 h-full">
                    <Download className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-white font-light tracking-wide">DOWNLOAD</span>
                  </div>
                </button>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <button
                  onClick={() => window.open("https://discord.gg/2KjaESrCFa", "_blank")}
                  className="w-full h-32 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-2xl hover:border-indigo-400/40 transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex flex-col items-center justify-center gap-3 h-full">
                    <MessageCircle className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-white font-light tracking-wide">DISCORD</span>
                  </div>
                </button>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <button
                  onClick={() => window.open("https://github.com/Renetatomm/renetato-s-executor", "_blank")}
                  className="w-full h-32 bg-gradient-to-br from-gray-600/20 to-gray-800/20 border border-gray-500/20 rounded-2xl hover:border-gray-400/40 transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-600/10 to-gray-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex flex-col items-center justify-center gap-3 h-full">
                    <Github className="w-8 h-8 text-gray-400 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-white font-light tracking-wide">SOURCE</span>
                  </div>
                </button>
              </motion.div>
            </div>

            {/* API Integration Info */}
            <Card className="bg-gray-900/20 backdrop-blur-xl border-white/5">
              <CardContent className="p-6">
                <h3 className="text-lg font-light text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  C# Integration
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-black/40 border border-white/10 rounded-xl">
                    <p className="text-gray-400 text-sm mb-2">Validation Endpoint:</p>
                    <code className="text-green-400 font-mono text-sm break-all">{getValidationUrl()}</code>
                  </div>
                  <p className="text-gray-500 text-sm font-light">
                    Replace {"{key}"} with the actual key in your C# application
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="xl:col-span-4 space-y-6"
          >
            {/* Recent Updates */}
            <Card className="bg-gray-900/20 backdrop-blur-xl border-white/5">
              <CardContent className="p-6">
                <h3 className="text-lg font-light text-white mb-6 flex items-center gap-2">
                  <Github className="w-5 h-5 text-purple-400" />
                  Updates
                </h3>
                <div className="space-y-4">
                  {commits.map((commit, index) => (
                    <motion.div
                      key={commit.sha}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group cursor-pointer"
                      onClick={() => {
                        if (commit.html_url && commit.html_url !== "#") {
                          window.open(commit.html_url, "_blank")
                        }
                      }}
                    >
                      <div className="p-3 rounded-xl hover:bg-white/5 transition-colors duration-300">
                        <p className="text-white text-sm font-medium line-clamp-2 mb-2">{commit.commit.message}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{commit.commit.author.name}</span>
                          <span>•</span>
                          <span>{new Date(commit.commit.author.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="bg-gray-900/20 backdrop-blur-xl border-white/5">
              <CardContent className="p-6">
                <h3 className="text-lg font-light text-white mb-6">Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-light">API</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 text-sm">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-light">Version</span>
                    <span className="text-white text-sm font-mono">v1.0</span>
                  </div>
                  {isOwner && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-light">Access</span>
                      <div className="flex items-center gap-2">
                        <Crown className="w-3 h-3 text-yellow-400" />
                        <span className="text-yellow-400 text-sm">Owner</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
