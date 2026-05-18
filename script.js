document.addEventListener("DOMContentLoaded", () => {
  const enlacesNavegacion = Array.from(document.querySelectorAll(".enlace-navegacion"));
  const seccionesNavegables = Array.from(document.querySelectorAll("main section[id]"));
  const panelNavegacionMovil = document.getElementById("panel-navegacion-movil");
  const prefiereMovimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  inicializarCierrePanelMovil();
  inicializarResaltadoSeccionActiva();
  inicializarEstadoInicial();
  inicializarAnimacionEntradaSecciones();
  inicializarPanelDiscoverability();
  inicializarSchemaFaqDinamico();
  inicializarAuditoriaFaqAio();

  function inicializarSchemaFaqDinamico() {
    const contenedorFaq = document.getElementById("acordeon-faq-tecnica");
    const scriptSchemaFaq = document.getElementById("faq-schema-jsonld");

    if (!contenedorFaq || !scriptSchemaFaq) {
      return;
    }

    const itemsFaq = Array.from(
      contenedorFaq.querySelectorAll(".accordion-item")
    );

    const preguntas = itemsFaq
      .map((item) => {
        const botonPregunta = item.querySelector(".accordion-button");
        const cuerpoRespuesta = item.querySelector(".accordion-body");

        const pregunta = botonPregunta?.textContent?.trim() || "";
        const respuesta = cuerpoRespuesta?.textContent?.replace(/\s+/g, " ").trim() || "";

        if (!pregunta || !respuesta) {
          return null;
        }

        return {
          "@type": "Question",
          "name": pregunta,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": respuesta
          }
        };
      })
      .filter(Boolean);

    if (!preguntas.length) {
      return;
    }

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${window.location.origin}${window.location.pathname}#faq-schema`,
      "mainEntity": preguntas
    };

    scriptSchemaFaq.textContent = JSON.stringify(faqSchema, null, 2);
  }

  function inicializarAuditoriaFaqAio() {
    const contenedorFaq = document.getElementById("acordeon-faq-tecnica");

    if (!contenedorFaq) {
        return;
    }

    const itemsFaq = Array.from(contenedorFaq.querySelectorAll(".accordion-item"));

    const terminosTecnicos = [
        "java",
        "spring boot",
        "spring security",
        "api rest",
        "dto",
        "jwt",
        "jpa",
        "hibernate",
        "postgresql",
        "mysql",
        "sql",
        "junit",
        "mockito",
        "arquitectura",
        "persistencia",
        "validación",
        "validaciones",
        "backend",
        "frontend",
        "discoverability",
        "seo",
        "geo",
        "sxo",
        "ai overviews"
    ];

    let totalAperturaDirecta = 0;
    let totalConTerminos = 0;
    let totalConListas = 0;
    let totalPotencialAlto = 0;

    itemsFaq.forEach((item) => {
        const boton = item.querySelector(".accordion-button");
        const body = item.querySelector(".accordion-body");

        if (!boton || !body) {
        return;
        }

        const textoPregunta = boton.textContent.trim();
        const parrafos = Array.from(body.querySelectorAll("p"));
        const listas = Array.from(body.querySelectorAll("ul, ol"));

        const primerParrafo = parrafos[0]?.textContent?.replace(/\s+/g, " ").trim() || "";
        const textoCompleto = body.textContent.replace(/\s+/g, " ").trim().toLowerCase();

        const palabrasPrimerParrafo = primerParrafo ? primerParrafo.split(" ").filter(Boolean).length : 0;
        const aperturaDirecta = palabrasPrimerParrafo >= 25 && palabrasPrimerParrafo <= 70;

        const primeraFrase = primerParrafo.split(".")[0]?.toLowerCase() || "";
        const tieneTerminosFuertes = terminosTecnicos.some((termino) =>
          primeraFrase.includes(termino)
        );

        const tieneLista = listas.length > 0;

        const preguntaNatural =
        textoPregunta.includes("¿Cómo") ||
        textoPregunta.includes("¿Qué") ||
        textoPregunta.includes("¿Por qué");

        let puntaje = 0;

        if (aperturaDirecta) puntaje += 1;
        if (tieneTerminosFuertes) puntaje += 1;
        if (tieneLista) puntaje += 1;
        if (preguntaNatural) puntaje += 1;

        if (aperturaDirecta) totalAperturaDirecta += 1;
        if (tieneTerminosFuertes) totalConTerminos += 1;
        if (tieneLista) totalConListas += 1;

        let nivel = "base";
        let label = "Base sólida";

        if (puntaje >= 4) {
          nivel = "alta";
          label = "Potencial editorial alto";
          totalPotencialAlto += 1;
        } else if (puntaje === 3) {
          nivel = "media";
          label = "Buena extractabilidad";
        } else {
          nivel = "base";
          label = "Necesita refuerzo";
        }

        let badge = item.querySelector(".badge-calidad-faq");

        if (!badge) {
          badge = document.createElement("div");
          badge.className = "badge-calidad-faq";
          body.appendChild(badge);
        }

        badge.className = `badge-calidad-faq badge-calidad-faq--${nivel}`;
        badge.textContent = label;

        item.dataset.faqScore = String(puntaje);
        item.dataset.faqOpeningWords = String(palabrasPrimerParrafo);
        item.dataset.faqHasList = tieneLista ? "true" : "false";
        item.dataset.faqHasTerms = tieneTerminosFuertes ? "true" : "false";
        item.dataset.faqNatural = preguntaNatural ? "true" : "false";
      });

      actualizarMetricaFaq("metrica-faq-directa", `${totalAperturaDirecta} de ${itemsFaq.length}`);
      actualizarMetricaFaq("metrica-faq-terminos", `${totalConTerminos} de ${itemsFaq.length}`);
      actualizarMetricaFaq("metrica-faq-listas", `${totalConListas} de ${itemsFaq.length}`);
      actualizarMetricaFaq("metrica-faq-potencial", `${totalPotencialAlto} de ${itemsFaq.length}`);

      function actualizarMetricaFaq(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
        elemento.textContent = valor;
        }
      }
  }

  function inicializarCierrePanelMovil() {
    enlacesNavegacion.forEach((enlace) => {
      enlace.addEventListener("click", (evento) => {
        const destino = enlace.getAttribute("href");

        if (!destino || !destino.startsWith("#")) {
            return;
        }

        const seccionObjetivo = document.querySelector(destino);
        if (!seccionObjetivo) {
            return;
        }

        evento.preventDefault();

        const ejecutarScroll = () => {
          const encabezado = document.querySelector(".encabezado-sitio");
          const alturaEncabezado = encabezado ? encabezado.offsetHeight : 0;
          const offsetExtra = 12;
          const posicionObjetivo =
            window.scrollY +
            seccionObjetivo.getBoundingClientRect().top -
            alturaEncabezado -
            offsetExtra;

          window.history.replaceState(null, "", destino);
          window.scrollTo({
            top: posicionObjetivo,
            behavior: prefiereMovimientoReducido ? "auto" : "smooth"
          });

          actualizarEstadoEnlaces(seccionObjetivo.id);
        };

        const panelVisible =
          panelNavegacionMovil &&
          panelNavegacionMovil.classList.contains("show") &&
          typeof bootstrap !== "undefined";

        if (panelVisible) {
          const instanciaPanelMovil =
            bootstrap.Offcanvas.getOrCreateInstance(panelNavegacionMovil);

          panelNavegacionMovil.addEventListener(
            "hidden.bs.offcanvas",
            () => {
                ejecutarScroll();
            },
            { once: true }
          );

          instanciaPanelMovil.hide();
        } else {
          ejecutarScroll();
        }
      });
  });
}

  function inicializarResaltadoSeccionActiva() {
  if (!seccionesNavegables.length || !enlacesNavegacion.length) {
    return;
  }

  function detectarSeccionActiva() {
    const offset = 140;
    let seccionActual = seccionesNavegables[0]?.id || "";

    seccionesNavegables.forEach((seccion) => {
      const top = seccion.getBoundingClientRect().top;

      if (top <= offset) {
        seccionActual = seccion.id;
      }
    });

    if (seccionActual) {
      actualizarEstadoEnlaces(seccionActual);
    }
  }

  detectarSeccionActiva();
  window.addEventListener("scroll", detectarSeccionActiva, { passive: true });
  window.addEventListener("resize", detectarSeccionActiva);
}

  function inicializarEstadoInicial() {
    const hashActual = window.location.hash.replace("#", "");

    if (hashActual) {
      actualizarEstadoEnlaces(hashActual);
      return;
    }

    const primeraSeccion = seccionesNavegables[0];
    if (primeraSeccion) {
      actualizarEstadoEnlaces(primeraSeccion.id);
    }
  }

  function actualizarEstadoEnlaces(idSeccionActiva) {
    enlacesNavegacion.forEach((enlace) => {
      const destinoEnlace = enlace.getAttribute("href");
      const estaActivo = destinoEnlace === `#${idSeccionActiva}`;

      enlace.classList.toggle("activo", estaActivo);

      if (estaActivo) {
        enlace.setAttribute("aria-current", "page");
      } else {
        enlace.removeAttribute("aria-current");
      }
    });
  }

  function inicializarAnimacionEntradaSecciones() {
    if (!seccionesNavegables.length) {
      return;
    }

    if (prefiereMovimientoReducido) {
      seccionesNavegables.forEach((seccion) => {
        seccion.classList.add("seccion-visible");
      });
      return;
    }

    const observadorAnimacion = new IntersectionObserver((entradas, observador) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("seccion-visible");
          observador.unobserve(entrada.target);
        }
      });
    }, {
      threshold: 0.12
    });

    seccionesNavegables.forEach((seccion) => {
      seccion.classList.add("seccion-animable");
      observadorAnimacion.observe(seccion);
    });
  }

  function inicializarPanelDiscoverability() {
    const title = document.querySelector("title")?.textContent?.trim() || "";
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() || "";
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href")?.trim() || "";
    const schemaBlocks = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));

    let schemaFaqDetectado = false;

    schemaBlocks.forEach((bloque) => {
      try {
        const contenido = JSON.parse(bloque.textContent);
        if (
          contenido["@type"] === "FAQPage" ||
          (Array.isArray(contenido["@graph"]) &&
            contenido["@graph"].some((item) => item["@type"] === "FAQPage"))
        ) {
          schemaFaqDetectado = true;
        }
      } catch (error) {
        // Ignorar bloques no parseables
      }
    });

    actualizarMetrica(
      "metrica-schema",
      schemaBlocks.length
        ? `Sí · ${schemaBlocks.length} bloque(s) · FAQPage ${schemaFaqDetectado ? "detectado" : "no detectado"}`
        : "No detectado"
    );
    const preguntasFaq = Array.from(document.querySelectorAll('#acordeon-faq-tecnica .accordion-item'));
    const respuestasFaq = Array.from(document.querySelectorAll('#acordeon-faq-tecnica .accordion-body'));
    const seccionesConId = Array.from(document.querySelectorAll('main section[id]'));
    const enlacesInternos = Array.from(document.querySelectorAll('a[href^="#"]'));

    const promedioRespuesta = respuestasFaq.length
      ? Math.round(
        respuestasFaq.reduce((acc, item) => acc + item.textContent.trim().length, 0) / respuestasFaq.length
        )
      : 0;

    actualizarMetrica("metrica-title", title ? `Sí · ${title.length} caracteres` : "No detectado");
    actualizarMetrica(
      "metrica-description",
      metaDescription ? `Sí · ${metaDescription.length} caracteres` : "No detectada"
    );
    actualizarMetrica("metrica-canonical", canonical ? "Sí · configurada" : "No detectado");
    actualizarMetrica("metrica-schema", schemaBlocks.length ? `Sí · ${schemaBlocks.length} bloque(s) · FAQPage ${schemaFaqDetectado ? "detectado" : "no detectado"}`: "No detectado" );
    actualizarMetrica("metrica-faq-count", `${preguntasFaq.length} preguntas detectadas`);
    actualizarMetrica("metrica-faq-length", promedioRespuesta ? `${promedioRespuesta} caracteres por respuesta` : "Sin datos" );
    actualizarMetrica("metrica-secciones-id", `${seccionesConId.length} secciones navegables`);
    actualizarMetrica("metrica-enlaces-internos", `${enlacesInternos.length} enlaces internos`);

    function actualizarMetrica(id, valor) {
      const elemento = document.getElementById(id);
      if (elemento) {
        elemento.textContent = valor;
      }
    }
  }
});