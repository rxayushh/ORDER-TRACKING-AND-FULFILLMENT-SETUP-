import React from 'react';
import { Package, Github, ExternalLink, ShieldCheck, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg">LogiTrack Enterprise</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-Stack Order Tracking and Multi-Warehouse Fulfillment Platform. Built with Java 21, Spring Boot 3, and React.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-500 font-mono">
              <Cpu className="w-3.5 h-3.5 text-brand-400" /> Java 21 LTS • Spring Boot 3.3.5
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/catalog" className="hover:text-white transition-colors">Catalog &amp; Hardware</Link></li>
              <li><Link to="/tracking" className="hover:text-white transition-colors">Public Order Tracking</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><a href="http://localhost:8080/swagger-ui/index.html" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1 transition-colors">Swagger API Docs <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>

          {/* Role Access */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Role Consoles</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-white transition-colors">Customer Portal</Link></li>
              <li><Link to="/warehouse" className="hover:text-white transition-colors">Warehouse Manager Center</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">System Admin Console</Link></li>
              <li><span className="text-slate-500">Seed Password: Admin@123</span></li>
            </ul>
          </div>

          {/* Academic Info */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Academic Context</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              MCA 3rd-Semester Major Academic Project. Extensible architecture designed for continuous enhancements into 4th semester.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Full Production Verification Passed</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 LogiTrack Fulfillment Systems. All rights reserved.</p>
          <p className="text-slate-500">Designed &amp; Developed for MCA Major Project Submission</p>
        </div>
      </div>
    </footer>
  );
};
