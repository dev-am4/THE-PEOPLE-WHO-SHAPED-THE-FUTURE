import { categories, people as basePeople } from './people-v3.js'

export { categories }

// V14 routes every portrait through our own cached 3:4 image endpoint.
// This prevents kiosk clients from depending directly on third-party image hosts
// and guarantees a consistent 720×960 portrait shape for all 12 profiles.
export const people = basePeople.map(person => ({
  ...person,
  portrait: `/api/portrait?id=${encodeURIComponent(person.id)}`,
  focus: '50% 50%',
}))
