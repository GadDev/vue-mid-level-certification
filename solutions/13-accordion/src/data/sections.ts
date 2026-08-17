export interface AccordionSection {
  id: string
  title: string
  body: string
}

export const sections: AccordionSection[] = [
  { id: 'shipping', title: 'Shipping', body: 'Orders ship within two business days.' },
  { id: 'returns', title: 'Returns', body: 'Thirty days, no questions asked.' },
  { id: 'support', title: 'Support', body: 'We answer every email within a day.' },
]
