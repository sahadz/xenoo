import Link from 'next/link'
import Image from 'next/image'

export default function ProductCard({p}) {
  return (
    <Link href={'/product/' + p.id}>
      <a>
        <div whileHover={{ scale: 1.02 }} className="card hover:shadow-md transition duration-200">
          <div className="h-48 w-full bg-gray-100 rounded-md mb-3 flex items-center justify-center overflow-hidden relative">
            {p.image_url ? (
              <Image src={p.image_url} alt={p.name} fill style={{objectFit:'cover'}} sizes="(max-width: 640px) 100vw, 33vw" />
            ) : (
              <div className="text-gray-400">No image</div>
            )}
          </div>
          <h3 className="font-semibold">{p.name}</h3>
          <p className="text-sm text-gray-500">{p.rate}</p>
        </div>
      </a>
    </Link>
  )
}
