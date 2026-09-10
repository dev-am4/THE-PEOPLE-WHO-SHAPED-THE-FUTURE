import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Code2,
  Expand,
  Home,
  Orbit,
  Palette,
  Rocket,
  Sparkles,
  X,
} from 'lucide-react'

const PROJECT_NAME = 'นิทรรศการดาราศาสตร์และอวกาศ'
const PROJECT_PLACE = 'ศูนย์วิทยาศาสตร์เพื่อการศึกษานครสวรรค์'
const RESET_MS = 90000

const categories = [
  { id: 'all', label: 'ทั้งหมด', icon: Sparkles },
  { id: 'science', label: 'วิทยาศาสตร์', icon: Atom },
  { id: 'space', label: 'อวกาศ', icon: Rocket },
  { id: 'technology', label: 'เทคโนโลยี', icon: Code2 },
  { id: 'creative', label: 'ความคิดสร้างสรรค์', icon: Palette },
]

const people = [
  {
    id: 'ajong',
    name: 'ดร.อาจอง ชุมสาย ณ อยุธยา',
    en: 'Art-Ong Jumsai Na Ayudhya',
    years: 'วิศวกรและนักการศึกษาไทย',
    category: ['space', 'science', 'technology'],
    color: '#32d7ff',
    initials: 'อจ',
    hook: 'คนไทยก็มีส่วนพามนุษย์ไปถึงดาวอังคาร',
    intro: 'วิศวกรชาวไทยผู้มีส่วนร่วมกับงานออกแบบชิ้นส่วนระบบลงจอดของยาน Viking ซึ่งถูกส่งไปสำรวจดาวอังคาร',
    impact: 'เรื่องราวของเขาชี้ให้เห็นว่า ความรู้ด้านวิศวกรรมจากประเทศไทยสามารถเชื่อมต่อกับภารกิจอวกาศระดับโลกได้',
    moment: 'จากงานวิศวกรรมไฟฟ้า สู่เทคโนโลยีที่ต้องทำงานอย่างแม่นยำในสภาพแวดล้อมสุดขั้วของดาวอังคาร',
    careers: ['วิศวกรอวกาศ', 'วิศวกรไฟฟ้า', 'วิศวกรระบบ', 'นักวิจัย'],
    skills: [88, 92, 78, 84, 90],
    skillLabels: ['คิดวิเคราะห์', 'แก้ปัญหา', 'คณิตศาสตร์', 'สร้างสรรค์', 'ทำงานเป็นทีม'],
  },
  {
    id: 'virul',
    name: 'ศ.ดร.วิรุฬห์ สายคณิต',
    en: 'Prof. Dr. Virulh Sa-yakanit',
    years: 'นักฟิสิกส์ไทย',
    category: ['science'],
    color: '#8b7cff',
    initials: 'วส',
    hook: 'ทำความเข้าใจโลกที่ “ไร้ระเบียบ” ด้วยกฎของควอนตัม',
    intro: 'นักฟิสิกส์ผู้บุกเบิกการประยุกต์แนวคิดควอนตัมและ Path Integral กับปัญหาในฟิสิกส์ของสสารควบแน่นและระบบไร้ระเบียบ',
    impact: 'งานลักษณะนี้ช่วยให้นักวิทยาศาสตร์เข้าใจการเคลื่อนที่ของอิเล็กตรอนในวัสดุที่ซับซ้อน และต่อยอดสู่เทคโนโลยีวัสดุและพลังงาน',
    moment: 'คำถามเล็ก ๆ เรื่องการเคลื่อนที่ของอนุภาค สามารถพาไปสู่ความเข้าใจวัสดุที่เราใช้สร้างเทคโนโลยีในอนาคต',
    careers: ['นักฟิสิกส์', 'นักวิจัยวัสดุ', 'นักวิทยาศาสตร์ควอนตัม', 'อาจารย์มหาวิทยาลัย'],
    skills: [96, 90, 98, 72, 82],
    skillLabels: ['คิดวิเคราะห์', 'แก้ปัญหา', 'คณิตศาสตร์', 'สร้างสรรค์', 'ความอดทน'],
  },
  {
    id: 'prawase',
    name: 'ศ.นพ.ประเวศ วะสี',
    en: 'Prof. Dr. Prawase Wasi',
    years: 'แพทย์ นักวิชาการ และนักคิดเชิงระบบ',
    category: ['science'],
    color: '#3ce6b0',
    initials: 'ปว',
    hook: 'วิทยาศาสตร์ไม่ได้เปลี่ยนแค่ห้องทดลอง แต่มันเปลี่ยนชีวิตคนได้',
    intro: 'แพทย์และนักวิชาการไทยที่มีผลงานด้านโลหิตวิทยา ธาลัสซีเมีย สาธารณสุข และการพัฒนาระบบสุขภาพ',
    impact: 'ทำให้เห็นว่าความรู้ทางวิทยาศาสตร์สามารถเดินทางจากงานวิจัย ไปสู่ระบบที่ช่วยผู้คนในระดับสังคม',
    moment: 'อนาคตไม่ได้ต้องการแค่นักวิทยาศาสตร์ที่เก่ง แต่ต้องการคนที่มองเห็นภาพใหญ่และเชื่อมความรู้เข้ากับผู้คน',
    careers: ['แพทย์นักวิจัย', 'นักวิทยาศาสตร์ชีวการแพทย์', 'นักวิเคราะห์นโยบาย', 'นักวิจัยสาธารณสุข'],
    skills: [92, 88, 80, 86, 96],
    skillLabels: ['คิดวิเคราะห์', 'วิจัย', 'ข้อมูล', 'คิดเชิงระบบ', 'เข้าใจผู้คน'],
  },
  {
    id: 'rawi',
    name: 'ศ.ดร.ระวี ภาวิไล',
    en: 'Prof. Dr. Rawi Bhavilai',
    years: 'นักดาราศาสตร์ไทย',
    category: ['science', 'space'],
    color: '#ffca55',
    initials: 'รภ',
    hook: 'คนที่ชวนคนไทยเงยหน้ามองฟ้า',
    intro: 'นักวิชาการด้านดาราศาสตร์รุ่นบุกเบิกของไทย มีผลงานศึกษาดวงอาทิตย์และมีบทบาทสำคัญในการสื่อสารปรากฏการณ์บนท้องฟ้าแก่สังคม',
    impact: 'เขาไม่ได้เพียงศึกษาท้องฟ้า แต่ช่วยทำให้ดาราศาสตร์กลายเป็นเรื่องที่เยาวชนและประชาชนเข้าถึงได้',
    moment: 'เมื่อเราเข้าใจดวงอาทิตย์ ดาวหาง หรือสุริยุปราคา ท้องฟ้าก็เปลี่ยนจากสิ่งไกลตัว เป็นห้องทดลองขนาดใหญ่ที่สุดของมนุษย์',
    careers: ['นักดาราศาสตร์', 'นักฟิสิกส์ดวงอาทิตย์', 'นักวิจัยอวกาศ', 'นักสื่อสารวิทยาศาสตร์'],
    skills: [90, 84, 92, 76, 94],
    skillLabels: ['สังเกตการณ์', 'แก้ปัญหา', 'ฟิสิกส์', 'สร้างสรรค์', 'สื่อสาร'],
  },
  {
    id: 'einstein',
    name: 'อัลเบิร์ต ไอน์สไตน์',
    en: 'Albert Einstein',
    years: '1879 — 1955',
    category: ['science', 'space'],
    color: '#7ed7ff',
    initials: 'AE',
    portrait: 'https://commons.wikimedia.org/wiki/Special:FilePath/Albert%20Einstein%20Head.jpg',
    hook: 'ถ้าเวลาไม่ได้เดินเท่ากันสำหรับทุกคนล่ะ?',
    intro: 'นักฟิสิกส์ผู้พัฒนาทฤษฎีสัมพัทธภาพ และอธิบายปรากฏการณ์โฟโตอิเล็กทริกซึ่งมีบทบาทสำคัญต่อฟิสิกส์สมัยใหม่',
    impact: 'แนวคิดเรื่องเวลา อวกาศ แสง และแรงโน้มถ่วงของเขา เปลี่ยนวิธีที่มนุษย์มองจักรวาล และยังเชื่อมโยงกับเทคโนโลยีที่เราใช้ในปัจจุบัน',
    moment: 'บางครั้งการเปลี่ยนโลก เริ่มจากการกล้าถามคำถามที่ดูเหมือนเป็นไปไม่ได้',
    careers: ['นักฟิสิกส์', 'นักจักรวาลวิทยา', 'นักวิจัยควอนตัม', 'นักดาราศาสตร์'],
    skills: [98, 96, 98, 98, 74],
    skillLabels: ['คิดวิเคราะห์', 'แก้ปัญหา', 'คณิตศาสตร์', 'จินตนาการ', 'สื่อสาร'],
  },
  {
    id: 'asimov',
    name: 'ไอแซค อาซิมอฟ',
    en: 'Isaac Asimov',
    years: '1920 — 1992',
    category: ['creative', 'science'],
    color: '#ff9a62',
    initials: 'IA',
    portrait: 'https://commons.wikimedia.org/wiki/Special:FilePath/Isaac.Asimov01.jpg',
    hook: 'บางครั้งอนาคต เริ่มจากเรื่องที่ยังไม่มีอยู่จริง',
    intro: 'นักเขียนนิยายวิทยาศาสตร์และหนังสือวิทยาศาสตร์ ผู้สร้างสรรค์โลกของหุ่นยนต์และชุดนิยาย Foundation',
    impact: 'งานของเขาทำให้ผู้คนตั้งคำถามถึงความสัมพันธ์ระหว่างมนุษย์ เทคโนโลยี ปัญญาประดิษฐ์ และสังคมในอนาคต',
    moment: 'จินตนาการไม่ใช่สิ่งตรงข้ามกับวิทยาศาสตร์ แต่มันสามารถเป็นพื้นที่ทดลองความคิดก่อนเทคโนโลยีจริงจะเกิดขึ้น',
    careers: ['นักเขียนวิทยาศาสตร์', 'นักสื่อสารวิทยาศาสตร์', 'นักออกแบบโลกอนาคต', 'นักสร้างสรรค์เนื้อหา'],
    skills: [82, 80, 78, 99, 98],
    skillLabels: ['คิดวิเคราะห์', 'ตั้งคำถาม', 'วิทยาศาสตร์', 'จินตนาการ', 'การเล่าเรื่อง'],
  },
  {
    id: 'armstrong',
    name: 'นีล อาร์มสตรอง',
    en: 'Neil Armstrong',
    years: '1930 — 2012',
    category: ['space', 'science'],
    color: '#e9f0ff',
    initials: 'NA',
    portrait: 'https://commons.wikimedia.org/wiki/Special:FilePath/Neil%20Armstrong%20pose.jpg',
    hook: 'ก้าวหนึ่งบนดวงจันทร์ เปลี่ยนความฝันของมนุษย์ทั้งโลก',
    intro: 'นักบินอวกาศและผู้บัญชาการภารกิจ Apollo 11 มนุษย์คนแรกที่ก้าวลงบนพื้นผิวดวงจันทร์ในปี 1969',
    impact: 'ภารกิจของเขาแสดงพลังของการทำงานเป็นทีม วิศวกรรม ความแม่นยำ และความกล้าในสถานการณ์ที่ความผิดพลาดแทบไม่มีพื้นที่ให้เกิดขึ้น',
    moment: 'เบื้องหลังก้าวที่โลกจดจำ คือการฝึกฝน การตัดสินใจ และทีมงานนับพันคนบนโลก',
    careers: ['นักบินอวกาศ', 'นักบินทดสอบ', 'วิศวกรการบิน', 'Mission Controller'],
    skills: [88, 96, 86, 82, 99],
    skillLabels: ['คิดวิเคราะห์', 'ตัดสินใจ', 'วิศวกรรม', 'ความกล้า', 'ทำงานเป็นทีม'],
  },
  {
    id: 'linus',
    name: 'ลีนุส ตูร์วัลดส์',
    en: 'Linus Torvalds',
    years: 'Software Engineer',
    category: ['technology'],
    color: '#6ee7ff',
    initials: 'LT',
    portrait: 'https://commons.wikimedia.org/wiki/Special:FilePath/LinuxCon%20Europe%20Linus%20Torvalds%2003.jpg',
    hook: 'โค้ดที่คนหนึ่งเริ่มเขียน กลายเป็นโครงสร้างพื้นฐานของโลกดิจิทัล',
    intro: 'วิศวกรซอฟต์แวร์ผู้สร้าง Linux kernel และ Git สองเทคโนโลยีที่มีอิทธิพลอย่างมากต่อการพัฒนาซอฟต์แวร์สมัยใหม่',
    impact: 'Linux ทำงานอยู่เบื้องหลังระบบจำนวนมหาศาล ส่วน Git กลายเป็นเครื่องมือมาตรฐานที่ทีมพัฒนาซอฟต์แวร์ใช้ทำงานร่วมกัน',
    moment: 'สิ่งที่เริ่มจากโปรเจกต์ส่วนตัว สามารถเติบโตได้เมื่อถูกออกแบบให้ผู้คนทั้งโลกเข้ามาร่วมสร้างต่อ',
    careers: ['Software Engineer', 'Systems Engineer', 'Cloud Engineer', 'Open-source Developer'],
    skills: [94, 98, 92, 88, 96],
    skillLabels: ['คิดเป็นระบบ', 'แก้ปัญหา', 'เขียนโปรแกรม', 'ออกแบบ', 'ร่วมมือ'],
  },
  {
    id: 'beeple',
    name: 'บีเพิล',
    en: 'Beeple · Mike Winkelmann',
    years: 'Digital Artist',
    category: ['creative', 'technology'],
    color: '#ff5ecf',
    initials: 'BW',
    hook: 'เมื่อศิลปะไม่ได้อยู่แค่บนผืนผ้าใบ',
    intro: 'ศิลปินดิจิทัล นักออกแบบกราฟิก และนักสร้างแอนิเมชัน ผู้ทดลองกับภาพ 3D วัฒนธรรมดิจิทัล และรูปแบบการนำเสนอใหม่ ๆ',
    impact: 'ผลงานของเขาสะท้อนว่าเทคโนโลยีสามารถกลายเป็นทั้งเครื่องมือ วัสดุ และพื้นที่จัดแสดงของศิลปินได้พร้อมกัน',
    moment: 'โลกอนาคตต้องการคนที่ไม่เพียงใช้เทคโนโลยีเป็น แต่สามารถเปลี่ยนมันให้กลายเป็นประสบการณ์ใหม่',
    careers: ['Digital Artist', 'Motion Designer', '3D Artist', 'Experience Designer'],
    skills: [78, 88, 84, 100, 92],
    skillLabels: ['คิดวิเคราะห์', 'เทคโนโลยี', '3D', 'สร้างสรรค์', 'เล่าเรื่อง'],
  },
  {
    id: 'nolan',
    name: 'คริสโตเฟอร์ โนแลน',
    en: 'Christopher Nolan',
    years: 'Filmmaker',
    category: ['creative', 'science'],
    color: '#ffbf6f',
    initials: 'CN',
    portrait: 'https://commons.wikimedia.org/wiki/Special:FilePath/Christopher%20Nolan%20Cannes%202018.jpg',
    hook: 'วิทยาศาสตร์ที่ยาก กลายเป็นเรื่องที่คนทั้งโลกอยากดูได้อย่างไร?',
    intro: 'ผู้กำกับและนักเขียนบทที่นำแนวคิดซับซ้อนเรื่องอวกาศ เวลา ความทรงจำ และการรับรู้ มาสร้างเป็นภาพยนตร์ที่เข้าถึงผู้ชมวงกว้าง',
    impact: 'ผลงานอย่าง Interstellar ทำให้แนวคิดฟิสิกส์อวกาศกลายเป็นส่วนหนึ่งของประสบการณ์ทางอารมณ์และการเล่าเรื่อง',
    moment: 'เมื่อวิทยาศาสตร์พบกับการเล่าเรื่อง ความรู้ที่ซับซ้อนก็สามารถกลายเป็นแรงบันดาลใจได้',
    careers: ['ผู้กำกับ', 'นักเขียนบท', 'Science Communicator', 'Creative Technologist'],
    skills: [86, 90, 80, 99, 100],
    skillLabels: ['คิดวิเคราะห์', 'แก้ปัญหา', 'วิทยาศาสตร์', 'สร้างสรรค์', 'เล่าเรื่อง'],
  },
  {
    id: 'elon',
    name: 'อีลอน มัสก์',
    en: 'Elon Musk',
    years: 'Technology Entrepreneur',
    category: ['space', 'technology'],
    color: '#63e2ff',
    initials: 'EM',
    portrait: 'https://commons.wikimedia.org/wiki/Special:FilePath/Elon%20Musk%20Royal%20Society%20(crop1).jpg',
    hook: 'ถ้าจรวดใช้แล้วไม่ต้องทิ้งล่ะ?',
    intro: 'ผู้ประกอบการเทคโนโลยีที่มีบทบาทกับ SpaceX และโครงการเทคโนโลยีอีกหลายด้าน โดย SpaceX ผลักดันการพัฒนาจรวดที่สามารถนำกลับมาใช้ซ้ำได้',
    impact: 'แนวทางดังกล่าวช่วยเปลี่ยนวิธีคิดเรื่องต้นทุนและความถี่ของการเดินทางสู่อวกาศ และทำให้การแข่งขันด้านอวกาศเชิงพาณิชย์เข้มข้นขึ้น',
    moment: 'คำถามแบบ First Principles เริ่มจากการรื้อสมมติฐานเดิม แล้วถามใหม่ว่า “อะไรคือข้อจำกัดที่แท้จริง?”',
    careers: ['วิศวกรอวกาศ', 'วิศวกรเครื่องกล', 'Robotics Engineer', 'Technology Entrepreneur'],
    skills: [94, 98, 90, 96, 88],
    skillLabels: ['คิดเป็นระบบ', 'แก้ปัญหา', 'วิศวกรรม', 'คิดต่าง', 'นำทีม'],
  },
  {
    id: 'knuth',
    name: 'โดนัลด์ คนูธ',
    en: 'Donald Knuth',
    years: 'Computer Scientist',
    category: ['technology', 'science'],
    color: '#a88cff',
    initials: 'DK',
    portrait: 'https://commons.wikimedia.org/wiki/Special:FilePath/Donald%20Knuth%20CHM%202011.jpg',
    hook: 'ก่อน AI จะฉลาด เราต้องเข้าใจว่าอัลกอริทึมคิดอย่างไร',
    intro: 'นักวิทยาศาสตร์คอมพิวเตอร์ผู้มีอิทธิพลต่อการวิเคราะห์อัลกอริทึม และผู้เขียน The Art of Computer Programming รวมถึงผู้สร้าง TeX',
    impact: 'งานของเขาช่วยวางรากฐานให้เราอธิบายได้ว่าโปรแกรมหนึ่ง ๆ ทำงานเร็วแค่ไหน ใช้ทรัพยากรมากเท่าไร และออกแบบให้ดีขึ้นอย่างไร',
    moment: 'เบื้องหลังเทคโนโลยีที่ดูฉลาด มักเริ่มจากการคิดอย่างเป็นขั้นตอนที่แม่นยำ',
    careers: ['Computer Scientist', 'Algorithm Engineer', 'AI Researcher', 'Software Architect'],
    skills: [100, 98, 100, 84, 90],
    skillLabels: ['ตรรกะ', 'แก้ปัญหา', 'คณิตศาสตร์', 'ออกแบบ', 'ความละเอียด'],
  },
]

function ProjectIdentity() {
  return (
    <div className="project-id">
      <div className="project-mark"><Orbit size={24} /></div>
      <div><strong>{PROJECT_NAME}</strong><span>{PROJECT_PLACE}</span></div>
    </div>
  )
}

function FullscreenButton() {
  const [full, setFull] = useState(Boolean(document.fullscreenElement))
  useEffect(() => {
    const onChange = () => setFull(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])
  async function toggle() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch (_) {}
  }
  return <button className="round-btn fullscreen-btn" onClick={toggle} aria-label="เต็มจอ"><Expand size={22}/><span>{full ? 'ออกเต็มจอ' : 'เต็มจอ'}</span></button>
}

function SpaceBackground() {
  return (
    <div className="space-bg" aria-hidden="true">
      <div className="nebula nebula-a"/><div className="nebula nebula-b"/>
      <div className="starfield"/><div className="grid-plane"/>
      <div className="orbit-line orbit-a"/><div className="orbit-line orbit-b"/>
    </div>
  )
}

function Portrait({ person, large = false }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={`portrait ${large ? 'portrait-large' : ''}`} style={{ '--accent': person.color }}>
      {person.portrait && !failed ? (
        <img src={person.portrait} alt={person.name} onError={() => setFailed(true)} draggable="false" />
      ) : (
        <div className="portrait-fallback"><span>{person.initials}</span></div>
      )}
      <div className="portrait-shade"/>
    </div>
  )
}

function RadarChart({ person }) {
  const size = 310
  const center = size / 2
  const radius = 105
  const pointsFor = (values) => values.map((value, i) => {
    const a = -Math.PI / 2 + i * (Math.PI * 2 / values.length)
    const r = radius * value
    return `${center + Math.cos(a) * r},${center + Math.sin(a) * r}`
  }).join(' ')
  const axis = person.skills.map((_, i) => {
    const a = -Math.PI / 2 + i * (Math.PI * 2 / person.skills.length)
    return { x: center + Math.cos(a) * radius, y: center + Math.sin(a) * radius }
  })
  return (
    <div className="radar-wrap">
      <svg className="radar" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="แผนผังทักษะ">
        {[.25,.5,.75,1].map(level => <polygon key={level} points={pointsFor(person.skills.map(() => level))} className="radar-ring"/>)}
        {axis.map((p,i) => <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} className="radar-axis"/>)}
        <polygon points={pointsFor(person.skills.map(v => v / 100))} className="radar-fill" style={{ '--accent': person.color }}/>
        {person.skills.map((v,i) => {
          const a = -Math.PI / 2 + i * (Math.PI * 2 / person.skills.length)
          const r = radius * v/100
          return <circle key={i} cx={center + Math.cos(a)*r} cy={center + Math.sin(a)*r} r="5" className="radar-dot" style={{ '--accent': person.color }}/>
        })}
      </svg>
      <div className="radar-labels">
        {person.skillLabels.map((label,i) => <span key={label} style={{ '--i': i }}>{label}</span>)}
      </div>
      <small>Skill Map เพื่อการเรียนรู้ · แสดงทักษะที่ผลงานของบุคคลนั้นสะท้อน ไม่ใช่คะแนนประเมินจริง</small>
    </div>
  )
}

function Attract({ onStart }) {
  return (
    <main className="screen attract-screen" onClick={onStart}>
      <SpaceBackground />
      <header className="attract-header"><ProjectIdentity/><FullscreenButton/></header>
      <section className="attract-center">
        <p className="eyebrow">FUTURE CAREERS ZONE · INTERACTIVE EXPERIENCE</p>
        <h1>THE PEOPLE<br/><span>WHO SHAPED</span><br/>THE FUTURE</h1>
        <p className="attract-thai">คนหนึ่งคน เปลี่ยนอนาคตของโลกได้อย่างไร?</p>
        <button className="start-btn" onClick={onStart}><span>แตะเพื่อสำรวจ</span><ArrowRight size={28}/></button>
        <p className="microcopy">SCIENCE · SPACE · TECHNOLOGY · CREATIVITY</p>
      </section>
      <div className="face-strip" aria-hidden="true">
        {people.slice(0,8).map(p => <div key={p.id} className="face-chip" style={{ '--accent': p.color }}><span>{p.initials}</span></div>)}
      </div>
    </main>
  )
}

function Gallery({ filter, setFilter, onSelect, onHome }) {
  const visible = useMemo(() => filter === 'all' ? people : people.filter(p => p.category.includes(filter)), [filter])
  return (
    <main className="screen gallery-screen">
      <SpaceBackground />
      <header className="gallery-header">
        <button className="round-btn" onClick={onHome}><Home size={22}/><span>หน้าแรก</span></button>
        <div className="gallery-title"><p>THE PEOPLE WHO SHAPED THE FUTURE</p><h1>เลือกบุคคลที่คุณอยากรู้จัก</h1></div>
        <FullscreenButton/>
      </header>
      <nav className="filters" aria-label="เลือกหมวดหมู่">
        {categories.map(cat => {
          const Icon = cat.icon
          return <button key={cat.id} className={filter === cat.id ? 'active' : ''} onClick={() => setFilter(cat.id)}><Icon size={20}/><span>{cat.label}</span></button>
        })}
      </nav>
      <section className="people-grid">
        {visible.map((person,index) => (
          <button className="person-card" key={person.id} onClick={() => onSelect(person.id)} style={{ '--accent': person.color, '--delay': `${index * 35}ms` }}>
            <Portrait person={person}/>
            <div className="card-index">{String(people.indexOf(person)+1).padStart(2,'0')}</div>
            <div className="card-copy">
              <span className="card-role">{person.years}</span>
              <h2>{person.name}</h2>
              <p>{person.en}</p>
              <strong>{person.hook}</strong>
            </div>
            <div className="card-action">แตะเพื่อสำรวจ <ArrowRight size={18}/></div>
          </button>
        ))}
      </section>
      <footer className="gallery-footer"><span>เลือกเรื่องราวที่สนใจ</span><i/><span>ทุกการค้นพบอาจเป็นจุดเริ่มต้นของอาชีพในอนาคต</span></footer>
    </main>
  )
}

function Detail({ person, onClose, onNext, onPrev, onHome }) {
  const [tab, setTab] = useState('story')
  useEffect(() => setTab('story'), [person.id])
  return (
    <main className="screen detail-screen" style={{ '--accent': person.color }}>
      <SpaceBackground />
      <header className="detail-header">
        <button className="round-btn" onClick={onClose}><X size={22}/><span>รายชื่อ</span></button>
        <div className="detail-position">{String(people.indexOf(person)+1).padStart(2,'0')} <span>/ {String(people.length).padStart(2,'0')}</span></div>
        <div className="detail-header-actions"><button className="round-btn icon-only" onClick={onHome}><Home size={22}/></button><FullscreenButton/></div>
      </header>

      <section className="detail-layout">
        <div className="detail-portrait-col">
          <Portrait person={person} large />
          <div className="portrait-caption"><span>{person.years}</span><b>{person.en}</b></div>
        </div>

        <div className="detail-content-col">
          <p className="eyebrow">A PERSON WHO SHAPED THE FUTURE</p>
          <h1>{person.name}</h1>
          <blockquote>“{person.hook}”</blockquote>
          <div className="detail-tabs">
            <button className={tab === 'story' ? 'active' : ''} onClick={() => setTab('story')}>เรื่องราว</button>
            <button className={tab === 'skills' ? 'active' : ''} onClick={() => setTab('skills')}>DNA OF GREATNESS</button>
            <button className={tab === 'career' ? 'active' : ''} onClick={() => setTab('career')}>อาชีพที่เชื่อมโยง</button>
          </div>

          <div className="tab-panel" key={`${person.id}-${tab}`}>
            {tab === 'story' && (
              <div className="story-panel">
                <div className="story-lead"><span>01</span><p>{person.intro}</p></div>
                <div className="story-lead"><span>02</span><p>{person.impact}</p></div>
                <div className="impact-quote"><Sparkles size={22}/><p>{person.moment}</p></div>
              </div>
            )}
            {tab === 'skills' && <RadarChart person={person}/>} 
            {tab === 'career' && (
              <div className="career-panel">
                <p className="career-intro">ถ้าเรื่องราวของคนนี้ทำให้คุณสนใจ ลองสำรวจอาชีพเหล่านี้ต่อ</p>
                <div className="career-grid">{person.careers.map((career,i) => <div key={career}><span>0{i+1}</span><strong>{career}</strong></div>)}</div>
                <div className="next-station"><BrainCircuit size={30}/><div><small>NEXT EXPERIENCE</small><b>ไปต่อที่ Career Radar Chart</b><p>ค้นหาว่าทักษะของคุณเชื่อมโยงกับอาชีพในอนาคตแบบไหน</p></div></div>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="detail-nav">
        <button onClick={onPrev}><ChevronLeft size={28}/><span>คนก่อนหน้า</span></button>
        <div className="detail-dots">{people.map(p => <i key={p.id} className={p.id === person.id ? 'active' : ''}/>)}</div>
        <button onClick={onNext}><span>คนถัดไป</span><ChevronRight size={28}/></button>
      </footer>
    </main>
  )
}

function Finale({ onExplore }) {
  return (
    <main className="screen finale-screen">
      <SpaceBackground />
      <section className="finale-content">
        <p className="eyebrow">THE FUTURE IS NOT FINISHED</p>
        <div className="future-ring"><span>?</span></div>
        <h1>THE NEXT NAME<br/><span>COULD BE YOURS.</span></h1>
        <p>ทุกคนที่คุณเพิ่งรู้จัก เริ่มต้นจากการตั้งคำถาม ทดลอง ล้มเหลว เรียนรู้ และสร้างสิ่งที่ยังไม่เคยมีมาก่อน</p>
        <h2>แล้วคุณล่ะ...อยากสร้างอนาคตแบบไหน?</h2>
        <button className="start-btn" onClick={onExplore}><ArrowLeft size={26}/><span>กลับไปสำรวจบุคคล</span></button>
      </section>
    </main>
  )
}

export default function App() {
  const [screen, setScreen] = useState('attract')
  const [selectedId, setSelectedId] = useState(null)
  const [filter, setFilter] = useState('all')
  const timerRef = useRef(null)
  const selected = people.find(p => p.id === selectedId)

  function goHome() {
    setSelectedId(null)
    setFilter('all')
    setScreen('attract')
  }

  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(timerRef.current)
      if (screen !== 'attract') timerRef.current = setTimeout(goHome, RESET_MS)
    }
    const events = ['pointerdown','pointermove','keydown','touchstart']
    events.forEach(evt => window.addEventListener(evt, resetTimer, { passive: true }))
    resetTimer()
    return () => {
      clearTimeout(timerRef.current)
      events.forEach(evt => window.removeEventListener(evt, resetTimer))
    }
  }, [screen])

  function selectPerson(id) {
    setSelectedId(id)
    setScreen('detail')
  }
  function move(delta) {
    const index = people.findIndex(p => p.id === selectedId)
    const nextIndex = (index + delta + people.length) % people.length
    setSelectedId(people[nextIndex].id)
  }

  if (screen === 'attract') return <Attract onStart={() => setScreen('gallery')}/>
  if (screen === 'finale') return <Finale onExplore={() => setScreen('gallery')}/>
  if (screen === 'detail' && selected) return <Detail person={selected} onClose={() => setScreen('gallery')} onHome={goHome} onNext={() => move(1)} onPrev={() => move(-1)}/>
  return <Gallery filter={filter} setFilter={setFilter} onSelect={selectPerson} onHome={goHome} onFinale={() => setScreen('finale')}/>
}
