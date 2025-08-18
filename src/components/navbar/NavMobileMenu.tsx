'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { X, Menu, Search, Bell, User } from 'lucide-react';
import { useNavbarState } from '@/hooks/useNavbarState';
import { useMobileGestures } from '@/hooks/useMobileGestures';
import { NavSearch } from './NavSearch';
import { NavUserMenu } from './NavUserMenu';
import { NavNotifications } from './NavNotifications';

interface NavMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NavMobileMenu({ isOpen, onClose }: NavMobileMenuProps) {
  const { user } = useNavbarState();
  const { swipeHandlers } = useMobileGestures({ onSwipeLeft: onClose });
  
  const [activeSection, setActiveSection] = useState<'menu' | 'search' | 'notifications'>('menu');

  const menuVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
          
          <motion.div
            {...swipeHandlers}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-xl z-50 lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Sections */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                  {/* Quick Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveSection('search')}
                      className={`flex-1 p-3 rounded-lg transition-colors ${
                        activeSection === 'search' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                      }`}
                    >
                      <Search className="w-5 h-5 mx-auto" />
                    </button>
                    <button
                      onClick={() => setActiveSection('notifications')}
                      className={`flex-1 p-3 rounded-lg transition-colors ${
                        activeSection === 'notifications' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                      }`}
                    >
                      <Bell className="w-5 h-5 mx-auto" />
                    </button>
                  </div>

                  {/* Dynamic Content */}
                  <AnimatePresence mode="wait">
                    {activeSection === 'search' && (
                      <motion.div
                        key="search"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <NavSearch isMobile />
                      </motion.div>
                    )}

                    {activeSection === 'notifications' && (
                      <motion.div
                        key="notifications"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <NavNotifications isMobile />
                      </motion.div>
                    )}

                    {activeSection === 'menu' && (
                      <motion.div
                        key="menu"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="space-y-2"
                      >
                        <nav className="space-y-1">
                          <a href="/" className="block px-4 py-2 rounded-lg hover:bg-gray-100">
                            Home
                          </a>
                          <a href="/courses" className="block px-4 py-2 rounded-lg hover:bg-gray-100">
                            Courses
                          </a>
                          <a href="/instructor" className="block px-4 py-2 rounded-lg hover:bg-gray-100">
                            Instructor Dashboard
                          </a>
                          <a href="/profile" className="block px-4 py-2 rounded-lg hover:bg-gray-100">
                            Profile
                          </a>
                        </nav>

                        {user && (
                          <div className="pt-4 border-t">
                            <NavUserMenu isMobile />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
