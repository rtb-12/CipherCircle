'use client';
import React, { useState } from 'react';
import { Sidebar, SidebarBody, SidebarLink } from '../ui/sidebar';
import {
  IconDashboard,
  IconMessage2,
  IconFolders,
  IconUsers,
  IconScale,
  IconShield,
  IconSettings,
  IconSun,
  IconMoon,
  IconWallet,
} from '@tabler/icons-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

export function SidebarApp() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [walletConnected, setWalletConnected] = useState(false); // State to track wallet connection
  const [walletAddress, setWalletAddress] = useState<string | null>(null); // State to store wallet address

  const links = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <IconDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: 'Documents',
      href: '/documents',
      icon: (
        <IconFolders className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: 'Clients',
      href: '/clients',
      icon: (
        <IconUsers className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: 'Cases',
      href: '/cases',
      icon: (
        <IconScale className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: 'Security',
      href: '/security',
      icon: (
        <IconShield className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: (
        <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  const handleConnectWallet = async () => {
    console.log('Connecting to Plug wallet...');
    // Check if the Plug extension is available
    if (!window.ic?.plug) {
      console.error('Plug wallet extension is not installed.');
      alert('Please install the Plug wallet extension to connect.');
      return;
    }

    try {
      // Request connection to the Plug wallet
      const hasAllowed = await window.ic.plug.requestConnect();

      if (hasAllowed) {
        console.log('Plug wallet is connected');
        setWalletConnected(true);
        console.log(walletConnected, 'yayay'); // Update wallet connection state

        // Fetch the wallet address
        const address = await window.ic.plug.agent.getPrincipal();
        setWalletAddress(address.toString()); // Store wallet address
      } else {
        console.log('Plug wallet connection was refused');
        alert('Plug wallet connection was refused.');
      }
    } catch (error) {
      console.error('Failed to connect to Plug wallet:', error);
      alert('Failed to connect to Plug wallet. Please try again.');
    }
  };

  return (
    <div
      className={cn('relative min-h-[100vh] flex', open && 'overflow-hidden')}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between ">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-thumb-rounded-full">
            <motion.div
              className=" py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {open ? <Logo /> : <LogoIcon />}
            </motion.div>

            <nav className="mt-4 flex flex-col gap-y-1.5 ">
              {links.map((link, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SidebarLink
                    link={link}
                    className="hover:bg-neutral-100 dark:hover:bg-neutral-700/50 py-2.5 rounded-lg transition-colors"
                    activeClassName="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                  />
                </motion.div>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-1.5  border-t border-neutral-200 dark:border-neutral-800 pt-4">
            {walletConnected ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative"
              >
                <SidebarLink
                  link={{
                    label: walletAddress
                      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                      : 'Wallet Connected',
                    href: '#',
                    icon: (
                      <IconWallet className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                    ),
                  }}
                  className="hover:bg-neutral-100 dark:hover:bg-neutral-700/50  py-2.5 rounded-lg transition-colors"
                />
                {!open && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-white dark:bg-neutral-800 px-3 py-1.5 rounded-lg shadow-lg text-sm border border-neutral-200 dark:border-neutral-700 hidden group-hover:block"
                  >
                    {walletAddress}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SidebarLink
                  link={{
                    label: 'Connect Wallet',
                    href: '#',
                    icon: (
                      <IconWallet className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                    ),
                    onClick: (e) => {
                      e.preventDefault();
                      handleConnectWallet();
                    },
                  }}
                  className="hover:bg-neutral-100 dark:hover:bg-neutral-700/50  py-2.5 rounded-lg transition-colors"
                />
              </motion.div>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <SidebarLink
                link={{
                  label: theme === 'light' ? 'Dark Mode' : 'Light Mode',
                  href: '#',
                  icon:
                    theme === 'light' ? (
                      <IconMoon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                    ) : (
                      <IconSun className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                    ),
                  onClick: (e) => {
                    e.preventDefault();
                    toggleTheme();
                  },
                }}
                className="hover:bg-neutral-100 dark:hover:bg-neutral-700/50  py-2.5 rounded-lg transition-colors"
              />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative"
            >
              <SidebarLink
                link={{
                  label: 'John Doe',
                  href: '/profile',
                  icon: (
                    <Image
                      src="/avatar-placeholder.jpg"
                      className="h-7 w-7 flex-shrink-0 rounded-full border-2 border-neutral-300 dark:border-neutral-600 group-hover:border-blue-500 transition-colors"
                      width={50}
                      height={50}
                      alt="Profile"
                    />
                  ),
                }}
                className=" py-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors"
              />
              {!open && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-white dark:bg-neutral-800 px-3 py-1.5 rounded-lg shadow-lg text-sm border border-neutral-200 dark:border-neutral-700 hidden group-hover:block"
                >
                  John Doe
                </motion.div>
              )}
            </motion.div>
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
}

// Improved Logo components with animations
export const Logo = () => {
  return (
    <Link href="/home" className="flex items-center gap-2">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="h-6 w-6 bg-blue-600 rounded-lg flex items-center justify-center"
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-xs font-bold"
        >
          CC
        </motion.span>
      </motion.div>
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="font-semibold text-lg text-black dark:text-white"
      >
        CipherCircle
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link href="/">
      <motion.div
        whileHover={{ rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        className="h-6 w-6 bg-blue-600 rounded-lg flex items-center justify-center"
      >
        <span className="text-white text-xs font-bold">CC</span>
      </motion.div>
    </Link>
  );
};
