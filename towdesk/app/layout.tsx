import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'TowDesk · Towing made simple',description:'Your calm, straightforward towing dispatch workspace.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
