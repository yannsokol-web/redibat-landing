/* @ds-bundle: {"format":3,"namespace":"RDibatDesignSystem_740ba3","components":[{"name":"AppButton","sourcePath":"components/app/AppButton.jsx"},{"name":"AppCard","sourcePath":"components/app/AppCard.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Eyebrow","sourcePath":"components/core/Eyebrow.jsx"},{"name":"FeatureCard","sourcePath":"components/core/FeatureCard.jsx"},{"name":"Frame","sourcePath":"components/core/Frame.jsx"}],"sourceHashes":{"components/app/AppButton.jsx":"7af65264d2a5","components/app/AppCard.jsx":"7b65f0563af0","components/core/Badge.jsx":"cf7941214173","components/core/Button.jsx":"6b3db237504c","components/core/Eyebrow.jsx":"c3862d861b61","components/core/FeatureCard.jsx":"fcef05bc81d8","components/core/Frame.jsx":"c8143756e4ac","ui_kits/landing/Features.jsx":"dae1cef2e396","ui_kits/landing/Header.jsx":"f8a039100f8d","ui_kits/landing/Hero.jsx":"194f3a83f4e4","ui_kits/landing/Showcase.jsx":"91a3cf116ac5","ui_kits/landing/SiteFooter.jsx":"d145cb1bb08a"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.RDibatDesignSystem_740ba3 = window.RDibatDesignSystem_740ba3 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/app/AppButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * AppButton — the light Windows-product action button.
 * "solid" = the blue gradient primary ("Générer"); "tonal" = soft toolbar button.
 */
function AppButton({
  children,
  variant = "solid",
  icon,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const variants = {
    solid: {
      color: "#fff",
      background: "linear-gradient(180deg, var(--a-blue), var(--a-blue-deep))",
      border: "none",
      boxShadow: "var(--a-shadow-btn)",
      padding: "13px 24px",
      fontWeight: 600,
      filter: hover ? "brightness(1.07)" : "none"
    },
    tonal: {
      color: "var(--a-text)",
      background: hover ? "#eef2f7" : "transparent",
      border: "none",
      padding: "10px 13px",
      fontWeight: 500
    },
    outline: {
      color: "var(--a-navy)",
      background: hover ? "#f0f4f9" : "#fff",
      border: "1px solid var(--a-border)",
      padding: "11px 18px",
      fontWeight: 500
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      fontFamily: "var(--app-ui)",
      fontSize: 16,
      borderRadius: "var(--r-md)",
      cursor: "pointer",
      lineHeight: 1.1,
      transition: "background .14s, filter .15s, transform .1s",
      ...variants[variant],
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: 17,
      height: 17
    }
  }, icon), children);
}
Object.assign(__ds_scope, { AppButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/app/AppButton.jsx", error: String((e && e.message) || e) }); }

// components/app/AppCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * AppCard — the light-surface action tile from the product home screen.
 * Icon chip, navy title, muted subtitle; hover lifts and reveals a blue underline.
 */
function AppCard({
  icon,
  title,
  children,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: "relative",
      background: "var(--a-panel)",
      border: `1px solid ${hover ? "#c4d2e8" : "var(--a-border)"}`,
      borderRadius: "var(--r-xl)",
      padding: "34px 30px 36px",
      cursor: "pointer",
      boxShadow: hover ? "var(--a-shadow-hover)" : "var(--a-shadow-card)",
      transform: hover ? "translateY(-3px)" : "none",
      transition: "border-color .18s, box-shadow .18s, transform .18s",
      fontFamily: "var(--app-ui)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: 13,
      background: "#eef1f5",
      display: "grid",
      placeItems: "center",
      color: "var(--a-navy)",
      marginBottom: 26
    }
  }, icon), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 22,
      fontWeight: 600,
      color: "var(--a-navy)",
      margin: "0 0 11px"
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      color: "var(--a-muted)",
      margin: 0
    }
  }, children), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 30,
      right: 30,
      bottom: 20,
      height: 3,
      background: "var(--a-blue)",
      opacity: hover ? 0.7 : 0,
      transition: "opacity .18s"
    }
  }));
}
Object.assign(__ds_scope, { AppCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/app/AppCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Status badge — translucent mono pill with an optional pulsing gradient dot.
 * The "● Bientôt disponible" chip from the landing header.
 */
function Badge({
  children,
  dot = true,
  pulse = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 9,
      fontFamily: "var(--mono)",
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: "0.04em",
      color: "var(--text-soft)",
      padding: "8px 15px",
      border: "1px solid var(--card-border)",
      borderRadius: "var(--r-pill)",
      background: "rgba(255,255,255,0.025)",
      backdropFilter: "blur(6px)",
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #2f80e0, #35c5ec)",
      animation: pulse ? "rdbt-pulse 2.6s ease-out infinite" : "none"
    }
  }), children, /*#__PURE__*/React.createElement("style", null, `@keyframes rdbt-pulse {
        0% { box-shadow: 0 0 0 0 oklch(0.80 0.115 224 / 0.5); }
        70% { box-shadow: 0 0 0 9px oklch(0.80 0.115 224 / 0); }
        100% { box-shadow: 0 0 0 0 oklch(0.80 0.115 224 / 0); }
      }`));
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Rédibat Button — the brand's call-to-action.
 * Primary = the navy→cyan gradient pill with a soft glow (the "Espace client" CTA).
 * Mono, uppercase, letter-spaced — matches the production landing page.
 */
function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  icon,
  iconRight,
  disabled = false,
  onClick,
  style,
  ...rest
}) {
  const sizes = {
    sm: {
      padding: "9px 17px",
      fontSize: 12
    },
    md: {
      padding: "11px 21px",
      fontSize: 13
    },
    lg: {
      padding: "13px 26px",
      fontSize: 13.5
    }
  };
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 9,
    fontFamily: "var(--mono)",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    textDecoration: "none",
    whiteSpace: "nowrap",
    cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: "var(--r-pill)",
    border: "0",
    lineHeight: 1,
    transition: "transform .18s ease, box-shadow .18s ease, filter .18s ease, background .18s ease, color .18s ease",
    opacity: disabled ? 0.5 : 1,
    ...sizes[size]
  };
  const variants = {
    primary: {
      color: "#fff",
      background: "var(--brand-grad)",
      textShadow: "0 1px 2px rgba(5,20,45,0.35)",
      boxShadow: "var(--shadow-cta)"
    },
    secondary: {
      color: "var(--text-soft)",
      background: "rgba(255,255,255,0.025)",
      border: "1px solid var(--card-border)",
      backdropFilter: "blur(6px)"
    },
    ghost: {
      color: "var(--text-soft)",
      background: "transparent",
      border: "1px solid transparent"
    }
  };
  const [hover, setHover] = React.useState(false);
  const hoverFx = !disabled && hover ? variant === "primary" ? {
    transform: "translateY(-1px)",
    filter: "brightness(1.06)",
    boxShadow: "var(--shadow-cta-hover)"
  } : {
    borderColor: "var(--accent-line)",
    color: "var(--text)"
  } : {};
  const Tag = href ? "a" : "button";
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    onClick: disabled ? undefined : onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...base,
      ...variants[variant],
      ...hoverFx,
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: 15,
      height: 15
    }
  }, icon), children, iconRight && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: 15,
      height: 15
    }
  }, iconRight));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Eyebrow — uppercase mono kicker with flanking hairlines, in bright cyan.
 * Sits above hero/section headings.
 */
function Eyebrow({
  children,
  rules = true,
  style,
  ...rest
}) {
  const rule = {
    content: '""',
    width: 26,
    height: 1,
    background: "var(--accent-line)",
    flex: "none"
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      fontFamily: "var(--mono)",
      fontSize: 12.5,
      fontWeight: 500,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--accent-bright)",
      ...style
    }
  }, rest), rules && /*#__PURE__*/React.createElement("span", {
    style: rule
  }), children, rules && /*#__PURE__*/React.createElement("span", {
    style: rule
  }));
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/core/FeatureCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * FeatureCard — numbered marketing card with a serif title and soft body.
 * Subtle border, near-transparent fill, hover lift + radial glow.
 */
function FeatureCard({
  num,
  title,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: "relative",
      border: `1px solid ${hover ? "var(--accent-line)" : "var(--card-border)"}`,
      borderRadius: "var(--r-xl)",
      background: hover ? "rgba(95,160,240,0.04)" : "var(--card)",
      padding: "26px 24px 28px",
      overflow: "hidden",
      transform: hover ? "translateY(-4px)" : "none",
      transition: "transform .35s cubic-bezier(0.2,0.8,0.2,1), border-color .35s, background .35s",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      background: "radial-gradient(420px 200px at 50% -40%, oklch(0.74 0.125 245 / 0.12), transparent 70%)",
      opacity: hover ? 1 : 0,
      transition: "opacity .4s"
    }
  }), num != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--mono)",
      fontSize: 12,
      color: "var(--accent)",
      letterSpacing: "0.06em",
      display: "block",
      marginBottom: 18,
      position: "relative"
    }
  }, num), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--display)",
      fontWeight: 500,
      fontSize: "1.24rem",
      letterSpacing: "-0.01em",
      color: "var(--text)",
      margin: "0 0 10px",
      lineHeight: 1.2,
      position: "relative"
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "0.95rem",
      color: "var(--text-soft)",
      margin: 0,
      position: "relative",
      lineHeight: 1.6
    }
  }, children));
}
Object.assign(__ds_scope, { FeatureCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/FeatureCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Frame.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Frame — wraps media (screenshots, app mockups) with technical registration
 * corner marks, the signature "blueprint" treatment from the landing page.
 */
function Frame({
  children,
  radius = 16,
  glow = true,
  style,
  ...rest
}) {
  const reg = pos => {
    const base = {
      position: "absolute",
      width: 16,
      height: 16,
      border: "1px solid var(--accent-line)",
      zIndex: 3,
      pointerEvents: "none"
    };
    const map = {
      tl: {
        top: -8,
        left: -8,
        borderRight: 0,
        borderBottom: 0
      },
      tr: {
        top: -8,
        right: -8,
        borderLeft: 0,
        borderBottom: 0
      },
      bl: {
        bottom: -8,
        left: -8,
        borderRight: 0,
        borderTop: 0
      },
      br: {
        bottom: -8,
        right: -8,
        borderLeft: 0,
        borderTop: 0
      }
    };
    return /*#__PURE__*/React.createElement("span", {
      style: {
        ...base,
        ...map[pos]
      }
    });
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: "relative",
      borderRadius: radius,
      ...style
    }
  }, rest), reg("tl"), reg("tr"), reg("bl"), reg("br"), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: radius,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.10)",
      boxShadow: glow ? "var(--shadow-frame)" : "0 30px 70px -36px rgba(0,0,0,0.7)"
    }
  }, children));
}
Object.assign(__ds_scope, { Frame });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Frame.jsx", error: String((e && e.message) || e) }); }

// ui_kits/landing/Features.jsx
try { (() => {
/* Rédibat landing — features grid + audience line */
function Features() {
  const {
    FeatureCard
  } = window.RDibatDesignSystem_740ba3;
  const items = [["01", "Rédaction structurée", "Construisez vos affaires par lots et articles, dans une arborescence claire — du CCTP complet jusqu'au moindre descriptif."], ["02", "Bibliothèque d'articles types", "Capitalisez vos articles types et réutilisez-les d'une affaire à l'autre. Votre bibliothèque s'enrichit à chaque projet."], ["03", "TCO & DPGF", "Produisez vos décompositions de prix (DPGF) et vos tableaux comparatifs des offres (TCO), intégrant directement les offres des entreprises consultées."], ["04", "Application de bureau", "Vos affaires en local, au format ouvert, avec import de vos documents Word existants. Sans connexion permanente."]];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 16,
      padding: "58px 0 26px"
    },
    className: "rdbt-features"
  }, items.map(([n, t, b]) => /*#__PURE__*/React.createElement(FeatureCard, {
    key: n,
    num: n,
    title: t
  }, b))), /*#__PURE__*/React.createElement("section", {
    style: {
      textAlign: "center",
      padding: "64px 0 26px",
      maxWidth: 680,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 46,
      height: 1,
      background: "var(--line-strong)",
      margin: "0 auto 28px"
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "1.08rem",
      color: "var(--text-soft)",
      textWrap: "pretty",
      lineHeight: 1.6,
      margin: 0
    }
  }, "Con\xE7u pour les ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--text)",
      fontWeight: 600
    }
  }, "ma\xEEtres d'\u0153uvre"), ", ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--text)",
      fontWeight: 600
    }
  }, "bureaux d'\xE9tudes"), ", ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--text)",
      fontWeight: 600
    }
  }, "\xE9conomistes de la construction"), " et entreprises du BTP.")));
}
window.Features = Features;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/landing/Features.jsx", error: String((e && e.message) || e) }); }

// ui_kits/landing/Header.jsx
try { (() => {
/* Rédibat landing — header */
function Header() {
  const {
    Badge,
    Button
  } = window.RDibatDesignSystem_740ba3;
  const dl = React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("path", {
    d: "M12 3v12"
  }), React.createElement("path", {
    d: "m7 11 5 5 5-5"
  }), React.createElement("path", {
    d: "M5 21h14"
  }));
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "30px 0"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    "aria-label": "R\xE9dibat \u2014 accueil",
    style: {
      display: "flex",
      alignItems: "center",
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/redibat-lockup-h-white.png",
    alt: "R\xE9dibat",
    style: {
      height: 36,
      width: "auto",
      display: "block"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 22
    }
  }, /*#__PURE__*/React.createElement(Badge, null, "Bient\xF4t disponible"), /*#__PURE__*/React.createElement(Button, {
    href: "https://api.redibat.fr/telecharger",
    size: "sm",
    icon: dl
  }, "Espace client")));
}
window.Header = Header;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/landing/Header.jsx", error: String((e && e.message) || e) }); }

// ui_kits/landing/Hero.jsx
try { (() => {
/* Rédibat landing — hero */
function Hero() {
  const {
    Eyebrow,
    Button
  } = window.RDibatDesignSystem_740ba3;
  const dl = React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("path", {
    d: "M12 3v12"
  }), React.createElement("path", {
    d: "m7 11 5 5 5-5"
  }), React.createElement("path", {
    d: "M5 21h14"
  }));
  return /*#__PURE__*/React.createElement("section", {
    style: {
      textAlign: "center",
      padding: "66px 0 44px",
      maxWidth: 860,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Logiciel de r\xE9daction de CCTP")), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--display)",
      fontWeight: 400,
      fontSize: "clamp(2.6rem, 6.2vw, 4.3rem)",
      lineHeight: 1.06,
      letterSpacing: "-0.022em",
      color: "var(--text)",
      margin: "0 0 26px",
      textWrap: "balance"
    }
  }, "Vos cahiers des clauses techniques, r\xE9dig\xE9s avec", " ", /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: "italic",
      background: "var(--brand-grad-text)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
      color: "transparent"
    }
  }, "m\xE9thode"), "."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "clamp(1.05rem, 2vw, 1.2rem)",
      color: "var(--text-soft)",
      maxWidth: 640,
      margin: "0 auto",
      textWrap: "pretty",
      lineHeight: 1.6
    }
  }, "Une application de bureau pour les professionnels du b\xE2timent : structurez vos affaires par lots et articles, r\xE9digez vos descriptifs plus facilement et capitalisez votre biblioth\xE8que \u2014 sans jamais perdre la main sur vos donn\xE9es."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 40
    }
  }, /*#__PURE__*/React.createElement(Button, {
    href: "https://api.redibat.fr/telecharger",
    size: "lg",
    icon: dl,
    "aria-label": "Espace client \u2014 t\xE9l\xE9charger R\xE9dibat"
  }, "Espace client \u2014 T\xE9l\xE9charger"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      marginTop: 14,
      fontFamily: "var(--mono)",
      fontSize: 11.5,
      letterSpacing: "0.03em",
      color: "var(--text-faint)"
    }
  }, "R\xE9serv\xE9 aux clients disposant d'un compte.")));
}
window.Hero = Hero;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/landing/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/landing/Showcase.jsx
try { (() => {
/* Rédibat landing — showcase: framed product preview with caption + registration corners */
function Showcase() {
  const {
    Frame
  } = window.RDibatDesignSystem_740ba3;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "48px 0 52px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontFamily: "var(--mono)",
      fontSize: 11.5,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "var(--text-faint)",
      marginBottom: 14,
      padding: "0 4px"
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent)"
    }
  }, "\u25B8"), " Aper\xE7u de l'application \u2014 interface r\xE9elle"), /*#__PURE__*/React.createElement("span", null, "R\xC9DIBAT")), /*#__PURE__*/React.createElement(Frame, null, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/screens/page-travail.png",
    alt: "R\xE9dibat \u2014 page de travail",
    style: {
      display: "block",
      width: "100%",
      height: "auto"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginTop: 26,
      fontFamily: "var(--mono)",
      fontSize: 11.5,
      letterSpacing: "0.04em",
      color: "var(--text-faint)"
    }
  }, "Arborescence par lots et articles \xB7 \xE9diteur de descriptifs \xB7 g\xE9n\xE9ration CCTP"));
}
window.Showcase = Showcase;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/landing/Showcase.jsx", error: String((e && e.message) || e) }); }

// ui_kits/landing/SiteFooter.jsx
try { (() => {
/* Rédibat landing — footer */
function SiteFooter() {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: "1px solid var(--line)",
      marginTop: 64,
      padding: "28px 0 46px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
      fontFamily: "var(--mono)",
      fontSize: 12,
      color: "var(--text-faint)",
      letterSpacing: "0.02em"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 R\xE9dibat"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "mailto:contact@redibat.fr",
    style: {
      color: "var(--text-soft)",
      textDecoration: "none"
    }
  }, "contact@redibat.fr"), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "var(--accent)",
      display: "inline-block"
    }
  }), "Bient\xF4t disponible"));
}
window.SiteFooter = SiteFooter;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/landing/SiteFooter.jsx", error: String((e && e.message) || e) }); }

__ds_ns.AppButton = __ds_scope.AppButton;

__ds_ns.AppCard = __ds_scope.AppCard;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.FeatureCard = __ds_scope.FeatureCard;

__ds_ns.Frame = __ds_scope.Frame;

})();
