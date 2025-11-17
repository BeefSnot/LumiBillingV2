import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const revalidate = 120 // Revalidate every 2 minutes

async function getProducts() {
  return prisma.product.findMany({
    where: { active: true },
    orderBy: { price: 'asc' },
    include: {
      server: {
        select: {
          name: true,
        }
      }
    }
  })
}

export default async function ClientProductsPage() {
  const products = await getProducts()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order New Service</h1>
        <p className="mt-2 text-sm text-gray-600">
          Choose from our available products
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{product.name}</CardTitle>
              <div className="text-sm text-gray-500 capitalize">
                {product.type.toLowerCase()}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    ${product.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    per {product.billingCycle.toLowerCase()}
                  </div>
                </div>

                {product.description && (
                  <p className="text-sm text-gray-600">{product.description}</p>
                )}

                <div className="space-y-2 text-sm">
                  {product.diskSpace && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Disk Space:</span>
                      <span className="font-medium">{product.diskSpace} GB</span>
                    </div>
                  )}
                  {product.bandwidth && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bandwidth:</span>
                      <span className="font-medium">{product.bandwidth} GB</span>
                    </div>
                  )}
                  {product.ram && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">RAM:</span>
                      <span className="font-medium">{product.ram} GB</span>
                    </div>
                  )}
                  {product.cpu && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">CPU Cores:</span>
                      <span className="font-medium">{product.cpu}</span>
                    </div>
                  )}
                </div>

                <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all">
                  Order Now
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        {products.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No products available at the moment.
          </div>
        )}
      </div>
    </div>
  )
}
