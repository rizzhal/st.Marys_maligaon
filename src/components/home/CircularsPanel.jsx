import React, { useEffect, useState } from 'react'
import { Bell, Calendar, Clock, Download, ExternalLink, FileText, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { schoolInfo } from '../../data/seedData.js'

const API_URL = '/api'

const formatDate = (date) => {
  if (!date) return ''
  const value = new Date(date)
  return Number.isNaN(value.getTime())
    ? ''
    : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(value)
}

const getPdfUrl = (pdf) => {
  if (!pdf) return null
  if (/^https?:\/\//i.test(pdf)) return pdf
  if (pdf.startsWith('/uploads/')) return `/api/files/${pdf.slice('/uploads/'.length)}`
  return pdf.startsWith('/') ? pdf : `/${pdf}`
}

const CircularsPanel = () => {
  const [circulars, setCirculars] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCircular, setSelectedCircular] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const loadCirculars = async () => {
      try {
        const response = await fetch(`${API_URL}/circulars`, { signal: controller.signal })
        if (!response.ok) throw new Error(`Unable to load circulars (${response.status})`)
        const payload = await response.json()
        setCirculars(Array.isArray(payload.data) ? payload.data : [])
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to load circulars:', error)
          setCirculars([])
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    loadCirculars()
    return () => controller.abort()
  }, [])

  const visibleCirculars = circulars.slice(0, 4)
  const pdfUrl = getPdfUrl(selectedCircular?.pdf)
  const downloadPdf = (event) => {
    event?.stopPropagation()
    if (pdfUrl) window.open(pdfUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <section className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-full h-full flex flex-col">
        <header className="bg-gradient-to-r from-amber-700 via-amber-600 to-orange-500 px-4 py-4 flex items-center gap-3 text-white">
          <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/20"><Bell size={20} /></span>
          <div>
            <h3 className="font-bold text-base tracking-wide">School Notices</h3>
            <p className="text-[10px] text-amber-100 mt-0.5">Important updates from the administration</p>
          </div>
          <span className="ml-auto text-[10px] font-medium bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30">
            {loading ? 'Loading' : `${visibleCirculars.length} ${visibleCirculars.length === 1 ? 'Notice' : 'Notices'}`}
          </span>
        </header>

        <div className="flex-1 p-4">
          {loading ? (
            <div className="h-full min-h-40 flex items-center justify-center text-sm text-gray-500">Loading circulars…</div>
          ) : visibleCirculars.length > 0 ? (
            <div className="space-y-3">
              {visibleCirculars.map((circular, index) => (
                <button key={circular._id} type="button" onClick={() => setSelectedCircular(circular)} className="group w-full text-left bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-amber-800 leading-tight line-clamp-2">{circular.title}</p>
                      {circular.description && <p className="text-xs text-gray-700 leading-relaxed line-clamp-2 mt-1">{circular.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-amber-100">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      {circular.date && <span className="flex items-center gap-1"><Calendar size={11} className="text-amber-500" />{formatDate(circular.date)}</span>}
                      {circular.time && <span className="flex items-center gap-1"><Clock size={11} className="text-amber-500" />{circular.time}</span>}
                    </div>
                    <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-1 shrink-0 group-hover:text-amber-700">View <ExternalLink size={11} /></span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full min-h-40 flex flex-col items-center justify-center text-center px-4">
              <Bell size={28} className="text-amber-400 mb-3" />
              <p className="text-sm font-semibold text-gray-600">No circulars available</p>
              <p className="text-xs text-gray-400 mt-1">New notices posted by the school will appear here.</p>
            </div>
          )}
        </div>

        <footer className="bg-gradient-to-r from-amber-50 to-amber-100/80 px-4 py-2.5 border-t border-amber-200/50">
          <p className="text-[10px] text-amber-700 font-medium text-center">{schoolInfo.shortName || schoolInfo.name} - {schoolInfo.branch}</p>
        </footer>
      </section>

      <AnimatePresence>
        {selectedCircular && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedCircular(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
              <header className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-6 py-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2"><Bell size={20} /><h3 className="font-bold text-lg">Circular</h3></div>
                <button type="button" onClick={() => setSelectedCircular(null)} className="p-1.5 rounded-full hover:bg-white/20" aria-label="Close circular"><X size={22} /></button>
              </header>
              <div className="p-6 space-y-4">
                <h4 className="text-xl font-bold text-amber-800">{selectedCircular.title}</h4>
                {(selectedCircular.date || selectedCircular.time) && <div className="flex items-center gap-4 text-sm text-gray-500 bg-amber-50 p-3 rounded-lg">
                  {selectedCircular.date && <span className="flex items-center gap-1.5"><Calendar size={16} className="text-amber-500" />{formatDate(selectedCircular.date)}</span>}
                  {selectedCircular.time && <span className="flex items-center gap-1.5"><Clock size={16} className="text-amber-500" />{selectedCircular.time}</span>}
                </div>}
                {selectedCircular.description && <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{selectedCircular.description}</p>}
                {pdfUrl && <button type="button" onClick={downloadPdf} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-sm font-semibold rounded-xl hover:from-amber-700 hover:to-amber-600"><FileText size={18} />Download PDF<Download size={16} /></button>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default CircularsPanel
