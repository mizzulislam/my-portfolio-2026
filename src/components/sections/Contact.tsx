import React from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import { SectionHeader } from '../UIComponents';

interface ContactProps {
  isDark: boolean;
  t: any;
}

export function Contact({ isDark, t }: ContactProps) {
  return (
    <section id="contact" className="py-20 px-6">
      <SectionHeader title={t.contactHeader} subTitle={t.contactSub} icon={Mail} isDark={isDark} />
      <div className={`max-w-5xl mx-auto rounded-[40px] p-1 bg-gradient-to-br from-blue-600 to-indigo-900 shadow-2xl`}>
        <div className={`rounded-[39px] p-8 md:p-16 flex flex-col md:flex-row gap-12 ${isDark ? 'bg-[#020617]' : 'bg-white'}`}>
          <div className="md:w-1/2">
            <h2 className={`text-3xl font-bold mb-8 tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.contactDetailsTitle}</h2>
            <div className="flex flex-col gap-5 text-left">
              <div className="flex items-center gap-5 group">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isDark ? 'bg-white/5 border border-white/5 group-hover:bg-blue-600/20' : 'bg-slate-100 group-hover:bg-blue-50'}`}>
                  <Mail size={20} className="text-blue-500" />
                </div>
                <span className={`text-sm md:text-base font-bold tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>mizzulislam.id@gmail.com</span>
              </div>
              <a href="https://wa.me/6287802568095" target="_blank" rel="noreferrer" className="flex items-center gap-5 group">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isDark ? 'bg-white/5 border border-white/5 group-hover:bg-green-600/20' : 'bg-slate-100 group-hover:bg-green-50'}`}>
                  <MessageCircle size={20} className="text-green-500" />
                </div>
                <span className={`text-sm md:text-base font-bold tracking-tight ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>+62 878-0256-8095</span>
              </a>
            </div>
          </div>
          <form className="md:w-1/2 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder={t.formName} className={`border rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
              <input type="text" placeholder={t.formLastName} className={`border rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
            </div>
            <input type="email" placeholder={t.formEmail} className={`w-full border rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
            <textarea rows={4} placeholder={t.formMsg} className={`w-full border rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all resize-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}></textarea>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl active:scale-[0.98] uppercase tracking-wider text-sm">{t.formBtn}</button>
          </form>
        </div>
      </div>
    </section>
  );
}
