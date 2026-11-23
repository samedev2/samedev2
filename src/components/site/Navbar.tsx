import { useCallback, useEffect, useState } from 'react';
import { Menu, MessageCircle, X } from 'lucide-react';
import { BrandMark } from '../../lib/icons';
import { cn } from '../../lib/utils';

interface NavLink {
  href: string;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { href: '#servicos', label: 'Serviços' },
  { href: '#notebooks', label: 'Notebooks' },
  { href: '#contato', label: 'Contato' },
];

interface NavbarProps {
  siteTitle: string;
  whatsappUrl: string;
}

export function Navbar({ siteTitle, whatsappUrl }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /**
   * Scroll-spy: destaca o item do menu da seção que está em leitura.
   *
   * Antes usava IntersectionObserver com uma faixa estreita
   * (`rootMargin: '-45% 0px -50% 0px'`). O callback só dispara quando
   * uma seção ENTRA ou SAI da faixa, e nunca limpa o estado quando
   * NENHUMA seção está dentro dela — o resultado era um destaque
   * obsoleto: na seção do eGPU (que fica entre Serviços e Notebooks e
   * não tem item de menu) o menu continuava marcando a última seção
   * lida, e ao voltar para o topo continuava marcando "Contato".
   *
   * Agora a seção ativa é derivada da posição: a última cujo topo já
   * passou da linha de leitura (35% da altura da janela). É
   * determinístico, não guarda estado obsoleto e não depende de
   * thresholds frágeis do observer.
   */
  useEffect(() => {
    const sections = NAV_LINKS.map((link) => ({
      href: link.href,
      element: document.querySelector(link.href),
    })).filter(
      (item): item is { href: string; element: Element } => item.element !== null,
    );
    if (sections.length === 0) return;

    const onScroll = () => {
      const readingLine = window.innerHeight * 0.35;
      let current = '';
      for (const { href, element } of sections) {
        if (element.getBoundingClientRect().top <= readingLine) current = href;
      }
      setActiveSection(current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Lock the page behind the mobile drawer and close it on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const navLinkClass = (href: string) =>
    cn(
      'relative py-1 text-sm font-bold uppercase tracking-[0.14em] transition-colors',
      activeSection === href ? 'text-brand-400' : 'text-white/65 hover:text-white',
    );

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-xl focus:bg-brand-400 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-ink-950"
      >
        Pular para o conteúdo
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[100] transition-all duration-300',
          scrolled || menuOpen
            ? 'glass border-b border-white/8 py-3 shadow-lg shadow-black/30'
            : 'border-b border-transparent py-5',
        )}
      >
        <div className="container-page flex items-center justify-between gap-4">
          <a
            href="#topo"
            onClick={closeMenu}
            className="flex items-center gap-2.5 rounded-xl"
            aria-label={`${siteTitle} — início`}
          >
            <BrandMark className="h-10 w-10 shrink-0" />
            <span className="text-lg font-black uppercase italic tracking-tighter sm:text-xl">
              {siteTitle}
            </span>
          </a>

          <nav aria-label="Navegação principal" className="hidden items-center gap-9 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={navLinkClass(link.href)}
                aria-current={activeSection === link.href ? 'true' : undefined}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute -bottom-0.5 left-0 h-px w-full origin-left bg-brand-400 transition-transform duration-300',
                    activeSection === link.href ? 'scale-x-100' : 'scale-x-0',
                  )}
                />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm hidden sm:inline-flex"
            >
              <MessageCircle className="h-4 w-4" />
              Orçamento
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="btn btn-outline btn-icon md:hidden"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[90] md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-sm"
            onClick={closeMenu}
          />
          <nav
            id="menu-mobile"
            aria-label="Navegação mobile"
            className="drawer-in absolute right-0 top-0 flex h-full w-[min(20rem,85vw)] flex-col border-l border-white/10 bg-ink-900 px-6 pb-8 pt-24 shadow-2xl shadow-black"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="flex items-center justify-between border-b border-white/6 py-5 text-lg font-black uppercase tracking-tight text-white/85 transition-colors hover:text-brand-400"
                >
                  {link.label}
                  <span className="text-xs font-bold text-white/20">0{i + 1}</span>
                </a>
              ))}
            </div>

            <div className="mt-auto space-y-4 pt-8">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="btn btn-primary btn-lg w-full"
              >
                <MessageCircle className="h-5 w-5" />
                Solicitar orçamento
              </a>
              <p className="text-center text-xs leading-relaxed text-white/35">
                Segunda a sábado, 08h às 18h
                <br />
                Atendimento em toda Fortaleza
              </p>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
