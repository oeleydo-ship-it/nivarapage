import { useState } from 'react'
import { ProductDetails, type StoreProduct } from '../product-details'
import { EditableText, editOf } from '../editable'
import { Media, SectionShell, str, bool } from '../primitives'
import { field, schema, text, textarea, toggle } from '../schema'
import { defineBlock } from '../types'
import { money } from './commerce'

type ProductCard = StoreProduct
const samples: ProductCard[] = [
  { id: 1, name: 'Everyday essentials', description: 'Thoughtfully made for your daily routine.', price: 4900, currency: 'USD', type: 'one_time' },
  { id: 2, name: 'The signature collection', description: 'A little more detail. A lasting impression.', price: 8900, currency: 'USD', type: 'one_time' },
  { id: 3, name: 'Something exceptional', description: 'Discover your next favourite.', price: 12900, currency: 'USD', type: 'one_time' },
]

export const productBlocks = ([
  ['grid', 'Product card grid'], ['featured', 'Product featured tiles'], ['list', 'Product compact list'],
] as const).map(([layout, label]) => defineBlock({
  type: `products.${layout}`, version: 1, category: 'products', label, icon: 'ShoppingBag',
  defaultProps: { heading: 'Discover our products', description: 'Explore the collection.', productIds: [], showDescription: true, showPrice: true },
  schema: schema(
    text('heading', 'Heading'), textarea('description', 'Introduction'),
    field('productIds', 'products', 'Dashboard products', 'content', { help: 'Choose the products to display. Only active products appear. Publish to update the live site.' }),
    toggle('showDescription', 'Show product descriptions'), toggle('showPrice', 'Show prices'),
  ),
  component: function ProductCollection(props) {
    const edit = editOf(props)
    const [selected, setSelected] = useState<ProductCard | null>(null)
    const cards = props.productPreview === true ? samples : (Array.isArray(props.productData) ? props.productData as ProductCard[] : [])
    if (!cards.length && !edit) return null
    return <><SectionShell props={props} className={`ud-products ud-products--${layout}`}>
      <div className="ud-products__intro">
        <EditableText edit={edit} path={['heading']} value={str(props.heading)} as="h2" className="ud-h2" />
        <EditableText edit={edit} path={['description']} value={str(props.description)} as="p" className="ud-lead" />
      </div>
      {!cards.length ? <p className="ud-products__empty">Choose dashboard products in the Content panel to display them here.</p> : (
        <div className="ud-products__items">{cards.map((product, index) => <article key={product.id} className="ud-products__card">
          <button type="button" className="ud-products__image ud-products__open" data-tone={index % 3} aria-label={`View ${product.name}`} disabled={!!edit || props.productPreview === true} onClick={() => setSelected(product)}>
            {product.image ? <Media src={product.image} alt={product.name} ratio="square" /> : <span className="ud-products__placeholder" aria-hidden="true">{product.name.slice(0, 1)}</span>}
          </button>
          <div className="ud-products__body">
            <h3 className="ud-h3"><button type="button" className="ud-products__title" disabled={!!edit || props.productPreview === true} onClick={() => setSelected(product)}>{product.name}</button></h3>
            {bool(props.showDescription, true) && product.description ? <p className="ud-products__description">{product.description}</p> : null}
            {bool(props.showPrice, true) ? <p className="ud-products__price">{money(product.price, product.currency)}{product.type === 'subscription' && product.interval ? ` / ${product.interval}` : ''}</p> : null}
            {product.inventory === 0 ? <span className="ud-small">Sold out</span> : null}
          </div>
        </article>)}</div>
      )}
    </SectionShell>{selected ? <ProductDetails product={selected} onClose={() => setSelected(null)} /> : null}</>
  },
}))
