import campaignDashboardSummary from '../components/portfolio-screenshots/safari-mockups/campaign-centre/01-dashboard-summary.webp'
import campaignDashboardDeepDive from '../components/portfolio-screenshots/safari-mockups/campaign-centre/02-dashboard-deep-dive.webp'
import campaignDetailsOverview from '../components/portfolio-screenshots/safari-mockups/campaign-centre/03-campaign-details-overview.webp'
import campaignDetails from '../components/portfolio-screenshots/safari-mockups/campaign-centre/04-campaign-details.webp'
import campaignCreate from '../components/portfolio-screenshots/safari-mockups/campaign-centre/05-create-campaign.webp'
import inflowenceHome from '../components/portfolio-screenshots/safari-mockups/inflowence/01-home.webp'
import inflowenceEthicInfluencer from '../components/portfolio-screenshots/safari-mockups/inflowence/02-ethic-influencer.webp'
import inflowenceBentoGrid from '../components/portfolio-screenshots/safari-mockups/inflowence/03-bento-grid-full.webp'
import inflowenceCriticalResponse from '../components/portfolio-screenshots/safari-mockups/inflowence/04-critical-response.webp'
import inflowencePrivacy from '../components/portfolio-screenshots/safari-mockups/inflowence/05-privacy.webp'
import inflowenceCopyright from '../components/portfolio-screenshots/safari-mockups/inflowence/06-copyright.webp'
import inflowenceRelaxation from '../components/portfolio-screenshots/safari-mockups/inflowence/07-relaxation.webp'
import inflowenceMemeGame from '../components/portfolio-screenshots/safari-mockups/inflowence/08-meme-game.webp'

const standardMockupSize = {
  width: 1958,
  height: 1182,
}

export const projectGalleryItems = [
  {
    image: campaignDashboardSummary,
    ...standardMockupSize,
    alt: 'Campaign Centre analytics dashboard showing a portfolio snapshot, budget use, lifecycle and campaign readiness.',
  },
  {
    image: campaignDashboardDeepDive,
    ...standardMockupSize,
    alt: 'Campaign Centre Deep Dive dashboard showing publication engagement, business performance and channel investment for FY26 Growth Engine.',
  },
  {
    image: campaignDetailsOverview,
    ...standardMockupSize,
    alt: 'Campaign Centre overview showing the FY26 Growth Engine snapshot, performance indicators, financial performance and generation progress.',
  },
  {
    image: campaignDetails,
    ...standardMockupSize,
    alt: 'Campaign Centre details showing FY26 Growth Engine identity, objectives, audience and financial setup.',
  },
  {
    image: campaignCreate,
    ...standardMockupSize,
    alt: 'Create Campaign form showing campaign identity, dates, classification, objectives and three-step progress.',
  },
  {
    image: inflowenceHome,
    ...standardMockupSize,
    alt: 'Inflowence home page with a Mindful Creator heading, responsibility message and About Our Website section.',
  },
  {
    image: inflowenceEthicInfluencer,
    ...standardMockupSize,
    alt: 'Inflowence Ethic Influencer page about authenticity, ethical responsibility and understanding audience impact.',
  },
  {
    image: inflowenceBentoGrid,
    width: 2612,
    height: 1637,
    alt: 'Inflowence relaxation activity grid with breathing, meditation, grounding, nature sounds, stretching, colour breathing and affirmation cards.',
  },
  {
    image: inflowenceCriticalResponse,
    ...standardMockupSize,
    alt: 'Inflowence Critical Response page with a feedback resilience heading and five illustrated mood choices.',
  },
  {
    image: inflowencePrivacy,
    ...standardMockupSize,
    alt: 'Inflowence Privacy Controls page with cross-platform guidance and platform-specific privacy setting panels.',
  },
  {
    image: inflowenceCopyright,
    ...standardMockupSize,
    alt: 'Inflowence Copyright page with creator rights guidance and Creative Commons licence cards.',
  },
  {
    image: inflowenceRelaxation,
    ...standardMockupSize,
    alt: 'Inflowence Relaxation Zone page with mindfulness guidance, a breathing exercise and a guided meditation activity.',
  },
  {
    image: inflowenceMemeGame,
    ...standardMockupSize,
    alt: 'Inflowence Meme-ory Palace page with a meme matching game, instructions, content warning and Start Game button.',
  },
]
