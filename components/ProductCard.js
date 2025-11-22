import Link from 'next/link'
import Image from 'next/image'

export default function ProductCard({p}) {
  const imageSrc = p.image_url || '/placeholder.png'
  return (
    <Link href={'/product/' + p.id}>
      <a>
        <div className="card hover:shadow-md transition duration-200">
          <div className="h-48 w-full bg-gray-100 rounded-md mb-3 flex items-center justify-center overflow-hidden relative">
            <Image src={imageSrc} alt={p.name || 'product'} layout="fill" objectFit="cover" />
          </div>
          <div className="px-2">
            <h3 className="text-lg font-medium">{p.name}</h3>
            <p className="text-sm text-gray-500">{p.rate}</p>
          </div>
        </div>
      </a>
    </Link>
  )
}
