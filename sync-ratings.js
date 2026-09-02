const { MongoClient } = require('mongodb');

async function syncRatings() {
  try {
    const client = await MongoClient.connect('mongodb://localhost:27017/niakylie');
    const db = client.db();
    const reviews = await db.collection('reviews').find({ isDeleted: false, status: 'APPROVED' }).toArray();

    for (const r of reviews) {
      const pId = r.productId;
      const allRevs = await db.collection('reviews').find({ productId: pId, isDeleted: false, status: 'APPROVED' }).toArray();
      const avg = allRevs.reduce((acc, x) => acc + x.rating, 0) / allRevs.length;
      await db.collection('products').updateOne(
        { _id: pId },
        { $set: { averageRating: Number(avg.toFixed(1)), reviewsCount: allRevs.length } }
      );
      console.log(`Updated product ${pId}: averageRating=${avg.toFixed(1)}, reviewsCount=${allRevs.length}`);
    }

    console.log('All product ratings synchronized successfully.');
    await client.close();
  } catch (err) {
    console.error('Error syncing ratings:', err);
  }
}

syncRatings();
