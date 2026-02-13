
import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Pin as Pinterest } from 'lucide-react';

const Footer: React.FC = () => {
  const sections = [
    {
      title: 'Customer Service',
      links: ['Contact Coco\'s', 'FAQs', 'Klarna', 'Order Lookup', 'Para Ayuda', 'Returns', 'Shipping & Delivery'],
    },
    {
      title: "Coco's Style Card",
      links: ["Apply for Coco's Card", 'Style Rewards Benefits', 'Gift Cards', 'Gift Card Balance', "Card Services", 'Pay Your Bill'],
    },
    {
      title: 'Stores & Services',
      links: ['Curbside & In Store Pickup', 'Locations & Hours', "Coco's App", "Fashion Stylist", "Wine Collection", 'Personal Shopper', 'Events', 'Feedback'],
    },
    {
      title: "Coco's Inc.",
      links: ['Corporate Sales', 'Corporate Site', 'Investors', 'Sourcing', "Careers", 'Our Mission', 'News Room', 'Site Map', 'Sustainability'],
    },
  ];

  return (
    <footer className="bg-black text-white border-t border-gray-800 mt-24">
        {/* Email Signup */}
        <div className="max-w-[1400px] mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-gray-800">
            <div className="md:col-span-2">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {sections.map(section => (
                        <div key={section.title}>
                            <h4 className="text-xs font-black uppercase mb-4 tracking-wider text-cocos-orange">{section.title}</h4>
                            <ul className="flex flex-col gap-2">
                                {section.links.map(link => (
                                    <li key={link} className="text-[11px] text-gray-400 hover:text-white hover:underline cursor-pointer transition-colors">{link}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                 </div>
            </div>
            <div className="flex flex-col gap-4">
                 <h4 className="text-xs font-black uppercase tracking-wider text-white underline decoration-cocos-orange decoration-2">Stay in the loop</h4>
                 <p className="text-[11px] text-gray-400">Join Coco's insiders for exclusive access to trends and sales.</p>
                 <div className="flex gap-2">
                    <input type="email" placeholder="Email Address" className="flex-grow bg-white border border-gray-700 px-4 py-2 text-sm rounded-sm text-black" />
                    <button className="bg-cocos-orange text-black text-xs font-bold px-6 py-2 rounded-sm uppercase hover:bg-white transition-colors">Sign Me Up</button>
                 </div>
                 <div className="bg-gray-900 p-4 text-[10px] text-gray-400 border border-cocos-orange/30">
                    <p className="font-bold text-cocos-orange mb-1">Get 25% off*</p>
                    <p>Coco's cardholders can take an extra 25% off when you sign up for emails. <span className="underline cursor-pointer text-white">Exclusions & Details</span></p>
                 </div>
                 
                 <div className="mt-4">
                    <h4 className="text-xs font-black uppercase tracking-wider mb-4 text-white">Follow Coco's</h4>
                    <div className="flex gap-4">
                        <Facebook size={20} className="text-gray-400 hover:text-cocos-orange cursor-pointer transition-colors" />
                        <Instagram size={20} className="text-gray-400 hover:text-cocos-orange cursor-pointer transition-colors" />
                        <Twitter size={20} className="text-gray-400 hover:text-cocos-orange cursor-pointer transition-colors" />
                        <Pinterest size={20} className="text-gray-400 hover:text-cocos-orange cursor-pointer transition-colors" />
                        <Youtube size={20} className="text-gray-400 hover:text-cocos-orange cursor-pointer transition-colors" />
                    </div>
                 </div>
            </div>
        </div>

        {/* Legal & Bottom Nav */}
        <div className="max-w-[1400px] mx-auto px-4 py-8 text-center text-[10px] text-gray-500">
             <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-6 font-bold uppercase text-gray-400">
                <a href="#" className="hover:text-cocos-orange hover:underline">Privacy Notice</a>
                <a href="#" className="hover:text-cocos-orange hover:underline">Cookie Preferences</a>
                <a href="#" className="hover:text-cocos-orange hover:underline">Interest Based Ads</a>
                <a href="#" className="hover:text-cocos-orange hover:underline">Legal Notice</a>
                <a href="#" className="hover:text-cocos-orange hover:underline">Accessibility</a>
             </div>
             <p className="text-gray-500">© 2025 Coco's Fashion Brands. All rights reserved. CocosFashionBrands.com, LLC. Style is our standard.</p>
        </div>
    </footer>
  );
};

export default Footer;
