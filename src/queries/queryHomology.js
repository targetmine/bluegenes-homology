const queryHomology = geneId => ({
	from: 'Gene',
	select: [
		'homology.genes.id',
		'homology.genes.primaryIdentifier',
		'homology.genes.symbol',
		'homology.genes.organism.id',
		'homology.genes.organism.taxonId',
		'homology.genes.organism.name',
		'homology.dataSet.name'
	],
	where: [
		{
			path: 'Gene.id',
			op: '=',
			code: 'A',
			value: geneId
		},
		{
			path: 'homology.genes',
			op: '!=',
			code: 'B',
			loopPath: 'Gene'
		}
	],
	constraintLogic: 'A and B'
});

function queryData(geneId, serviceUrl, imjsClient = imjs) {
	return new Promise((resolve, reject) => {
		const service = new imjsClient.Service({ root: serviceUrl });
		service
			.records(queryHomology(geneId))
			.then(data => {
				if (data.length) resolve(data[0]);
				else reject('No associated homology annotations.');
			})
			.catch(reject);
	});
}

module.exports = queryData;
