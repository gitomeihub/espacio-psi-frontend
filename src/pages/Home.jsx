function Home() {
  return (
    <main>
      <section className="hero" id="inicio">
        <div className="container hero-content">
          <div className="hero-text">
            <p className="eyebrow">Psicología online y presencial</p>

            <h1>Tu espacio de escucha y bienestar emocional</h1>

            <p className="hero-description">
              En ESPACIO PSI te acompañamos en tu proceso personal con una atención
              cercana, profesional y segura. Reservá tu turno de forma simple y elegí
              la modalidad que mejor se adapte a vos.
            </p>

            <div className="hero-actions">
              <a href="#turnos" className="btn btn-primary">
                Reservar turno
              </a>

              <a href="#sobre-mi" className="btn btn-secondary">
                Conocer más
              </a>
            </div>
          </div>

          <div className="hero-card">
            <h2>Próximos horarios disponibles</h2>

            <div className="slot">
              <span>Lunes</span>
              <strong>10:00 hs</strong>
            </div>

            <div className="slot">
              <span>Miércoles</span>
              <strong>16:30 hs</strong>
            </div>

            <div className="slot">
              <span>Viernes</span>
              <strong>09:00 hs</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="sobre-mi">
        <div className="container">
          <h2>Sobre la profesional</h2>
          <p>
            Atención psicológica orientada a adolescentes y adultos, desde un enfoque
            integrador que combina herramientas del psicoanálisis y la terapia
            cognitivo conductual.
          </p>
        </div>
      </section>

      <section className="section section-alt" id="modalidades">
        <div className="container">
          <h2>Modalidades de atención</h2>

          <div className="cards">
            <article className="card">
              <h3>Sesión online</h3>
              <p>
                Ideal para quienes prefieren realizar la consulta desde su casa,
                mediante un enlace de videollamada.
              </p>
            </article>

            <article className="card">
              <h3>Sesión presencial</h3>
              <p>
                Atención en consultorio, en un espacio tranquilo, privado y preparado
                para el encuentro terapéutico.
              </p>
            </article>

            <article className="card">
              <h3>Gestión de turnos</h3>
              <p>
                Reservá, reprogramá o cancelá tus turnos de manera simple desde el
                portal del paciente.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="turnos">
        <div className="container turnos-box">
          <h2>Reservá tu próximo turno</h2>
          <p>
            En pocos pasos vas a poder elegir día, horario, modalidad y confirmar tu
            cita.
          </p>

          <a href="#" className="btn btn-primary">
            Comenzar reserva
          </a>
        </div>
      </section>
    </main>
  )
}

export default Home