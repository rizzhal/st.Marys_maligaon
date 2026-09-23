'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Navigate } from './routing.jsx'
import { Toaster } from 'react-hot-toast'

import ProtectedAdminRoute from './admin/components/ProtectedAdminRoute.jsx'
import AdminLogin from './admin/pages/AdminLogin.jsx'
import AdminDashboard from './admin/pages/AdminDashboard.jsx'
import ManagementPage from './admin/pages/ManagementPage.jsx'
import CommitteePage from './admin/pages/CommitteePage.jsx'
import StaffPage from './admin/pages/StaffPage.jsx'
import TeachingStaffPage from './admin/pages/TeachingStaffPage.jsx'
import CircularsPage from './admin/pages/CircularsPage.jsx'
import GalleryPage from './admin/pages/GalleryPage.jsx'
import DownloadsPage from './admin/pages/DownloadsPage.jsx'

import TopBar from './components/layout/TopBar.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import NotFound from './pages/NotFound.jsx'
import Gallery from './pages/Gallery.jsx'
import Downloads from './pages/Downloads.jsx'
import ContactUs from './pages/ContactUs.jsx'

import Founder from './pages/about/Founder.jsx'
import CoFounders from './pages/about/CoFounders.jsx'
import History from './pages/about/History.jsx'
import MissionVision from './pages/about/MissionVision.jsx'
import EducationalApproach from './pages/about/EducationalApproach.jsx'

import Management from './pages/administration/Management.jsx'
import ManagingCommittee from './pages/administration/ManagingCommittee.jsx'
import Staff from './pages/administration/Staff.jsx'
import TeachingStaff from './pages/administration/TeachingStaff.jsx'

import MandatoryPublicDisclosure from './pages/cbse/MandatoryPublicDisclosure.jsx'
import SchoolInfo from './pages/cbse/SchoolInfo.jsx'

import Fees from './pages/students/Fees.jsx'
import Rules from './pages/students/Rules.jsx'
import Leave from './pages/students/Leave.jsx'
import Examination from './pages/students/Examination.jsx'
import Discipline from './pages/students/Discipline.jsx'
import Uniform from './pages/students/Uniform.jsx'
import ParentsNoticeEnrollment from './pages/students/ParentsNoticeEnrollment.jsx'

import Transport from './pages/infrastructure/Transport.jsx'

import CoCurricular from './pages/activities/CoCurricular.jsx'
import Sports from './pages/activities/Sports.jsx'
import Excursions from './pages/activities/Excursions.jsx'
import Clubs from './pages/activities/Clubs.jsx'

const publicPages = {
  '/': Home,
  '/login': Login,
  '/gallery': Gallery,
  '/downloads': Downloads,
  '/contact-us': ContactUs,
  '/about/founder': Founder,
  '/about/co-founders': CoFounders,
  '/about/history': History,
  '/about/mission-vision': MissionVision,
  '/about/educational-approach': EducationalApproach,
  '/administration/management': Management,
  '/administration/managing-committee': ManagingCommittee,
  '/administration/staff': Staff,
  '/administration/teaching-staff': TeachingStaff,
  '/administration/management-committee': ManagingCommittee,
  '/administrative/management': Management,
  '/administrative/managing-committee': ManagingCommittee,
  '/administrative/management-committee': ManagingCommittee,
  '/administrative/staff': Staff,
  '/administrative/teaching-staff': TeachingStaff,
  '/cbse/mandatory-public-disclosure': MandatoryPublicDisclosure,
  '/cbse/school-info': SchoolInfo,
  '/students/fees': Fees,
  '/students/rules': Rules,
  '/students/leave': Leave,
  '/students/examination': Examination,
  '/students/discipline': Discipline,
  '/students/uniform': Uniform,
  '/students/parents-notice-enrollment': ParentsNoticeEnrollment,
  '/infrastructure/transport': Transport,
  '/activities/co-curricular': CoCurricular,
  '/activities/sports': Sports,
  '/activities/excursions': Excursions,
  '/activities/clubs': Clubs,
}

const adminPages = {
  '/admin/dashboard': AdminDashboard,
  '/admin/management': ManagementPage,
  '/admin/committee': CommitteePage,
  '/admin/staff': StaffPage,
  '/admin/teaching-staff': TeachingStaffPage,
  '/admin/circulars': CircularsPage,
  '/admin/gallery': GalleryPage,
  '/admin/downloads': DownloadsPage,
}

function AdminContent({ pathname }) {
  if (pathname === '/admin/login') return <AdminLogin />
  if (pathname === '/admin') return <AdminRedirect />

  const Page = adminPages[pathname]
  if (!Page) return <NotFound />

  return (
    <ProtectedAdminRoute>
      <Page />
    </ProtectedAdminRoute>
  )
}

function AdminRedirect() {
  return <Navigate to="/admin/dashboard" replace />
}

export default function App() {
  const pathname = usePathname()
  const routePath = pathname === '/' ? pathname : pathname.replace(/\/+$/, '')

  if (routePath === '/admin' || routePath.startsWith('/admin/')) {
    return (
      <>
        <Toaster position="top-right" />
        <AdminContent pathname={routePath} />
      </>
    )
  }

  const Page = publicPages[routePath] || NotFound

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex flex-col min-h-screen">
        <TopBar />
        <Navbar />
        <main className="flex-1">
          <Page />
        </main>
        <Footer />
      </div>
    </>
  )
}
