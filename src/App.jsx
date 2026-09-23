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

import Home from './site-pages/Home.jsx'
import Login from './site-pages/Login.jsx'
import NotFound from './site-pages/NotFound.jsx'
import Gallery from './site-pages/Gallery.jsx'
import Downloads from './site-pages/Downloads.jsx'
import ContactUs from './site-pages/ContactUs.jsx'

import Founder from './site-pages/about/Founder.jsx'
import CoFounders from './site-pages/about/CoFounders.jsx'
import History from './site-pages/about/History.jsx'
import MissionVision from './site-pages/about/MissionVision.jsx'
import EducationalApproach from './site-pages/about/EducationalApproach.jsx'

import Management from './site-pages/administration/Management.jsx'
import ManagingCommittee from './site-pages/administration/ManagingCommittee.jsx'
import Staff from './site-pages/administration/Staff.jsx'
import TeachingStaff from './site-pages/administration/TeachingStaff.jsx'

import MandatoryPublicDisclosure from './site-pages/cbse/MandatoryPublicDisclosure.jsx'
import SchoolInfo from './site-pages/cbse/SchoolInfo.jsx'

import Fees from './site-pages/students/Fees.jsx'
import Rules from './site-pages/students/Rules.jsx'
import Leave from './site-pages/students/Leave.jsx'
import Examination from './site-pages/students/Examination.jsx'
import Discipline from './site-pages/students/Discipline.jsx'
import Uniform from './site-pages/students/Uniform.jsx'
import ParentsNoticeEnrollment from './site-pages/students/ParentsNoticeEnrollment.jsx'

import Transport from './site-pages/infrastructure/Transport.jsx'

import CoCurricular from './site-pages/activities/CoCurricular.jsx'
import Sports from './site-pages/activities/Sports.jsx'
import Excursions from './site-pages/activities/Excursions.jsx'
import Clubs from './site-pages/activities/Clubs.jsx'

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
