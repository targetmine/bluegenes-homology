const queryProteinOrtholog = geneId => ({
	from: 'Gene',
	select: [
		'proteins.orthologProteins.genes.id',
		'proteins.orthologProteins.genes.primaryIdentifier',
		'proteins.orthologProteins.genes.symbol',
		'proteins.orthologProteins.genes.organism.id',
		'proteins.orthologProteins.genes.organism.taxonId',
		'proteins.orthologProteins.genes.organism.name'
	],
	where: [
		{
			path: 'Gene.id',
			op: '=',
			value: geneId
		}
	]
});

function queryData(geneId, serviceUrl, imjsClient = imjs) {
	return new Promise((resolve, reject) => {
		const service = new imjsClient.Service({ root: serviceUrl });
		service
			.records(queryProteinOrtholog(geneId))
			.then(data => {
				if (data.length) resolve(data[0]);
				else reject('No associated bi-directional best hit ortholog.');
			})
			.catch(reject);
	});
}

module.exports = queryData;
