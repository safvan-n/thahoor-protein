import { type ReactNode } from 'react';
import { Navbar } from './Navbar';
import { MapPin } from 'lucide-react';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Navbar />
            <main className="flex-grow pt-0">
                {children}
            </main>
            <footer className="bg-muted/30 border-t py-12">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-xl font-bold text-primary mb-4">THAHOOR PROTEIN</h3>
                        <p className="text-muted-foreground max-w-sm">Premium fresh meat delivered to your doorstep. Quality you can trust, taste you will love.</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>Shop</li>
                            <li>About Us</li>
                            <li>Privacy Policy</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Contact</h4>
                        <p className="text-sm text-muted-foreground underline decoration-primary/30 underline-offset-4 hover:text-primary transition-colors cursor-pointer">
                            <a href="mailto:thahoorprotein@gmail.com">thahoorprotein@gmail.com</a>
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            8075575472<br />
                            04792446480
                        </p>
                        <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
                            <MapPin size={16} className="mt-1 text-primary shrink-0" />
                            <a
                                href="https://www.google.com/maps/search/?api=1&query=5GF2%2BXXG%2C%20SH%206%2C%20Kayamkulam%2C%20Kerala%20690502"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors text-left block"
                            >
                                5GF2+XXG, SH 6,<br />
                                Kayamkulam, Kerala 690502
                            </a>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-12 pt-8 border-t text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Thahoor Protein. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
