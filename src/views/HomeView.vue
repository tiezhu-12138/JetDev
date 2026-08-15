<script setup>
import BlurReveal from '../components/effects/BlurReveal.vue'
import ParticlesBackground from '../components/effects/ParticlesBackground.vue'
import TextHighlight from '../components/effects/TextHighlight.vue'
import {
  about,
  contact,
  currently,
  education,
  experience,
  hero,
  projects,
  skillGroups,
} from '../content/home.js'

const projectVariants = ['primary', 'secondary', 'tertiary']

const caseStudySteps = [
  { key: 'problem', label: 'Problem' },
  { key: 'role', label: 'My role' },
  { key: 'approach', label: 'Technical approach' },
  { key: 'challenges', label: 'Challenges' },
  { key: 'result', label: 'Result' },
]

function projectNumber(index) {
  return String(index + 1).padStart(2, '0')
}

function isExternalLink(href) {
  return href.startsWith('http')
}
</script>

<template>
  <main id="main-content">
    <section id="home" class="hero" aria-labelledby="hero-title">
      <ParticlesBackground />

      <div class="hero__inner section-shell">
        <div class="hero__copy">
          <p class="eyebrow">{{ hero.eyebrow }}</p>
          <h1 id="hero-title" class="hero__title">{{ hero.title }}</h1>
          <p class="hero__summary">{{ hero.introduction }}</p>

          <div class="hero__actions" aria-label="Primary actions">
            <a class="button-link button-link--primary" :href="hero.primaryAction.href">
              {{ hero.primaryAction.label }}
            </a>
            <a
              class="button-link button-link--secondary"
              :href="hero.secondaryAction.href"
              download="Jiahang_SUN_Resume.pdf"
            >
              {{ hero.secondaryAction.label }}
            </a>
          </div>

          <div class="hero__utility-links" aria-label="Professional profiles">
            <a
              v-for="link in hero.socialLinks"
              :key="link.href"
              class="text-link"
              :href="link.href"
              target="_blank"
              rel="noreferrer"
            >
              {{ link.label }}
            </a>
          </div>
        </div>

        <aside class="hero__status" aria-label="Current availability">
          <p class="hero__status-label">{{ currently.label }}</p>
          <p class="hero__status-copy">{{ currently.text }}</p>
          <dl class="hero__facts">
            <div class="hero__fact">
              <dt>Location</dt>
              <dd>{{ hero.location }}</dd>
            </div>
            <div class="hero__fact">
              <dt>Focus</dt>
              <dd>Data, services and interfaces</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>

    <section id="about" class="content-section section-shell" aria-labelledby="about-title">
      <header class="section-heading">
        <div>
          <p class="section-heading__meta">01 / Profile</p>
          <h2 id="about-title">{{ about.heading }}</h2>
        </div>
        <p class="section-heading__intro">
          Full-stack development grounded in clear models, dependable services and accessible interfaces.
        </p>
      </header>

      <div class="about-layout">
        <p class="about-layout__label">Professional direction and working approach</p>
        <BlurReveal v-slot="{ entered }" class="about-layout__copy">
          {{ about.bodyBeforeQualification
          }}<TextHighlight :active="entered" sequence="first">{{
            about.qualificationHighlight
          }}</TextHighlight
          >{{ about.bodyBetweenHighlights
          }}<TextHighlight :active="entered" sequence="second">{{
            about.workingApproachHighlight
          }}</TextHighlight
          >{{ about.bodyAfter }}
        </BlurReveal>
      </div>
    </section>

    <section id="projects" class="content-section section-shell" aria-labelledby="projects-title">
      <header class="section-heading">
        <div>
          <p class="section-heading__meta">02 / Projects</p>
          <h2 id="projects-title">Selected Projects</h2>
        </div>
        <p class="section-heading__intro">
          Selected work across product engineering, data workflows and accessible web delivery.
        </p>
      </header>

      <div class="projects-grid">
        <article
          v-for="(project, index) in projects"
          :key="project.id"
          :class="['project-feature', `project-feature--${projectVariants[index]}`]"
        >
          <header class="project-feature__header">
            <div class="project-feature__meta">
              <span>{{ project.context }}</span>
              <span>{{ projectNumber(index) }}</span>
            </div>
            <p class="project-feature__number" aria-hidden="true">{{ projectNumber(index) }}</p>
            <h3>{{ project.title }}</h3>
            <p class="project-feature__summary">{{ project.summary }}</p>
            <ul class="project-feature__stack" :aria-label="project.technologyLabel">
              <li v-for="technology in project.technologies" :key="technology">
                {{ technology }}
              </li>
            </ul>
            <p v-if="project.scopeNote" class="project-feature__scope">
              {{ project.scopeNote }}
            </p>
          </header>

          <dl class="project-feature__details">
            <div
              v-for="step in caseStudySteps"
              :key="step.key"
              class="project-feature__detail"
            >
              <dt>{{ step.label }}</dt>
              <dd>{{ project.caseStudy[step.key] }}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>

    <section class="content-section section-shell" aria-labelledby="skills-title">
      <header class="section-heading">
        <div>
          <p class="section-heading__meta">03 / Toolkit</p>
          <h2 id="skills-title">Technical Skills</h2>
        </div>
        <p class="section-heading__intro">
          Technologies used across internship and course work, grouped by practical area.
        </p>
      </header>

      <div class="skills-grid">
        <article v-for="group in skillGroups" :key="group.name" class="skill-group">
          <h3>{{ group.name }}</h3>
          <ul class="skill-group__items">
            <li v-for="skill in group.skills" :key="skill">{{ skill }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section
      id="experience"
      class="content-section section-shell"
      aria-labelledby="experience-title"
    >
      <header class="section-heading">
        <div>
          <p class="section-heading__meta">04 / Experience</p>
          <h2 id="experience-title">Relevant Experience</h2>
        </div>
        <p class="section-heading__intro">
          Software delivery experience across product development, data automation and cloud workflows.
        </p>
      </header>

      <div class="experience-list">
        <article v-for="role in experience" :key="role.organisation" class="experience-item">
          <header class="experience-item__meta">
            <h3 class="experience-item__organisation">{{ role.organisation }}</h3>
            <p class="experience-item__role">{{ role.role }}</p>
            <p class="experience-item__location">{{ role.location }}</p>
            <p class="experience-item__dates">{{ role.period }}</p>
          </header>

          <div class="experience-item__body">
            <p class="experience-item__summary">{{ role.summary }}</p>
            <ul class="experience-item__bullets">
              <li v-for="highlight in role.highlights" :key="highlight">{{ highlight }}</li>
            </ul>
          </div>
        </article>
      </div>
    </section>

    <section class="content-section section-shell" aria-labelledby="education-title">
      <header class="section-heading">
        <div>
          <p class="section-heading__meta">05 / Education</p>
          <h2 id="education-title">Education</h2>
        </div>
        <p class="section-heading__intro">
          Formal study spanning information technology and international business economics.
        </p>
      </header>

      <div class="education-grid">
        <article v-for="item in education" :key="item.qualification" class="education-item">
          <p class="education-item__year">{{ item.period }}</p>
          <h3>{{ item.qualification }}</h3>
          <p>{{ item.institution }}</p>
        </article>
      </div>
    </section>

    <section
      id="contact"
      class="content-section contact-section"
      aria-labelledby="contact-title"
    >
      <div class="section-shell">
        <header class="section-heading">
          <div>
            <p class="section-heading__meta">06 / Contact</p>
            <h2 id="contact-title">{{ contact.heading }}</h2>
          </div>
          <p class="section-heading__intro">{{ contact.body }}</p>
        </header>

        <div class="contact-layout">
          <div class="contact-layout__body">
            <p class="contact-layout__label">Direct contact</p>
            <p class="contact-layout__intro">
              The simplest way to start a conversation is by email.
            </p>
            <a class="contact-layout__email" :href="contact.methods[0].href">
              {{ contact.methods[0].value }}
            </a>
          </div>

          <div class="contact-links" aria-label="Contact details">
            <a
              v-for="method in contact.methods.slice(1)"
              :key="method.href"
              class="contact-links__row"
              :href="method.href"
              :target="isExternalLink(method.href) ? '_blank' : undefined"
              :rel="isExternalLink(method.href) ? 'noreferrer' : undefined"
            >
              <span>{{ method.label }}</span>
              <span>{{ method.value }}</span>
            </a>
            <div class="contact-links__row">
              <span>Location</span>
              <span>{{ contact.location }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer section-shell">
    <span>Jiahang “Jet” Sun</span>
    <span>Melbourne, Australia</span>
  </footer>
</template>
