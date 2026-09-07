import type { PageSection, Product } from '@uidesired/types'

export function withDashboardProducts(sections: PageSection[], products: Product[]): PageSection[] {
  const catalogue = new Map(products.filter((product) => product.status === 'active').map((product) => [String(product.id), product]))
  return sections.map((section) => {
    if (!['products.grid', 'products.featured', 'products.list'].includes(section.type)) return section
    const ids = Array.isArray(section.props.productIds) ? [...new Set(section.props.productIds.map(String))] : []
    return { ...section, props: { ...section.props, productPreview: false, productData: ids.flatMap((id) => {
      const product = catalogue.get(id)
      if (!product) return []
      const { id: productId, name, description, image, price, currency, type, interval, inventory } = product
      return [{ id: productId, name, description, image, price, currency, type, interval, inventory }]
    }) } }
  })
}
