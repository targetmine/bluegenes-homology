import React from 'react';
import queryProteinOrtholog from './queries/queryProteinOrtholog';
import queryHomology from './queries/queryHomology';

class BestHitTableBody extends React.Component {
	render() {
		const data = this.props.data;
		return (
			<tbody>
				{data.map((row, index) => (
					<tr className={index % 2 ? 'odd' : 'even'} key={row.gene.objectId}>
						<td>
							<span
								className="naviLink"
								onClick={() => {
									this.props.navigate('report', {
										type: row.organism.class,
										id: row.organism.objectId
									});
								}}
							>
								{row.organism.name}
							</span>
						</td>
						<td>
							<span
								className="naviLink"
								onClick={() => {
									this.props.navigate('report', {
										type: row.gene.class,
										id: row.gene.objectId
									});
								}}
							>
								{row.gene.primaryIdentifier}
							</span>
						</td>
						<td>
							<span
								className="naviLink"
								onClick={() => {
									this.props.navigate('report', {
										type: row.gene.class,
										id: row.gene.objectId
									});
								}}
							>
								{row.gene.symbol}
							</span>
						</td>
						<td></td>
					</tr>
				))}
			</tbody>
		);
	}
}

class HomolgyTableBody extends React.Component {
	render() {
		const data = this.props.data;

		var dataSetInfo = {
			Gene: { name: 'Orthologs from Annotation Pipeline', class: 'gene' },
			'KEGG Orthology': { name: 'KEGG Orthology (KO)', class: 'kegg' },
			HomoloGene: { name: 'HomoloGene', class: 'homolo' }
		};
		return (
			<tbody>
				{data.map((row, index) => (
					<tr className={index % 2 ? 'odd' : 'even'} key={row.gene.objectId}>
						<td>
							<span
								className="naviLink"
								onClick={() => {
									this.props.navigate('report', {
										type: row.gene.organism.class,
										id: row.gene.organism.objectId
									});
								}}
							>
								{row.gene.organism.name}
							</span>
						</td>
						<td>
							<span
								className="naviLink"
								onClick={() => {
									this.props.navigate('report', {
										type: row.gene.class,
										id: row.gene.objectId
									});
								}}
							>
								{row.gene.primaryIdentifier}
							</span>
						</td>
						<td>
							<span
								className="naviLink"
								onClick={() => {
									this.props.navigate('report', {
										type: row.gene.class,
										id: row.gene.objectId
									});
								}}
							>
								{row.gene.symbol}
							</span>
						</td>
						<td>
							{row.dataSets.map((ds, index) => (
								<span
									key={index}
									className={'dataSource ' + dataSetInfo[ds].class}
									title={dataSetInfo[ds].name}
								>
									{ds.substr(0, 1)}
								</span>
							))}
						</td>
					</tr>
				))}
			</tbody>
		);
	}
}

class NoDataTableBody extends React.Component {
	render() {
		return (
			<tbody>
				<tr>
					<td colSpan="4" className="noData">
						{this.props.message}
					</td>
				</tr>
			</tbody>
		);
	}
}

class FootNote extends React.Component {
	render() {
		const data = this.props.data;
		if (data) {
			return (
				<div className="footNote">
					* &nbsp;
					<span className="dataSource kegg">K</span>:{' '}
					<span
						className="naviLink"
						onClick={() => {
							this.props.navigate('report', {
								type: data['KEGG Orthology'].class,
								id: data['KEGG Orthology'].objectId
							});
						}}
					>
						KEGG Orthology (KO)
					</span>
					, &nbsp;
					<span className="dataSource gene">G</span>:{' '}
					<span
						className="naviLink"
						onClick={() => {
							this.props.navigate('report', {
								type: data['Gene'].class,
								id: data['Gene'].objectId
							});
						}}
					>
						Orthologs from Annotation Pipeline
					</span>
					, &nbsp;
					<span className="dataSource homolo">H</span>:{' '}
					<span
						className="naviLink"
						onClick={() => {
							this.props.navigate('report', {
								type: data['HomoloGene'].class,
								id: data['HomoloGene'].objectId
							});
						}}
					>
						HomoloGene
					</span>
					.
				</div>
			);
		} else {
			return (
				<div className="footNote">
					* &nbsp;
					<span className="dataSource kegg">K</span>: KEGG Orthology (KO),
					&nbsp;
					<span className="dataSource gene">G</span>: Orthologs from Annotation
					Pipeline, &nbsp;
					<span className="dataSource homolo">H</span>: HomoloGene.
				</div>
			);
		}
	}
}

class RootContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			bidirectionalBestHit: [],
			otherHomology: [],
			dataSets: null,
			bdbhError: null,
			otherError: null
		};
	}
	componentDidMount() {
		const orthologInfo = [];
		queryProteinOrtholog(this.props.entity.Gene.value, this.props.serviceUrl)
			.then(res => {
				res.proteins.forEach(protein => {
					protein.orthologProteins.forEach(orthologProtein => {
						orthologProtein.genes.forEach(gene => {
							orthologInfo.push({ gene: gene, organism: gene.organism });
						});
					});
				});

				this.setState({ bidirectionalBestHit: orthologInfo });
			})
			.catch(error => {
				this.setState({ bdbhError: error });
			});

		const homologyInfo = [];
		queryHomology(this.props.entity.Gene.value, this.props.serviceUrl)
			.then(res => {
				var homology = {};
				var dataSets = {};
				res.homology.forEach(element => {
					var ds_name = element.dataSet.name;
					dataSets[ds_name] = element.dataSet;
					element.genes.forEach(gene => {
						if (homology[gene.primaryIdentifier]) {
							homology[gene.primaryIdentifier].dataSets.push(ds_name);
						} else {
							homology[gene.primaryIdentifier] = {
								gene: gene,
								dataSets: [ds_name]
							};
						}
					});
				});
				var org_order = {
					'9606': 1,
					'10116': 2,
					'10090': 3,
					'9483': 4,
					'9541': 5,
					'9544': 6,
					'9615': 7,
					'9986': 8,
					'7955': 9,
					'7227': 10
				};

				var keys = Object.keys(homology);
				keys.sort(function(a, b) {
					return (
						org_order[homology[a].gene.organism.taxonId] -
						org_order[homology[b].gene.organism.taxonId]
					);
				});

				keys.map(key => {
					homologyInfo.push(homology[key]);
				});

				this.setState({ otherHomology: homologyInfo, dataSets: dataSets });
			})
			.catch(error => {
				this.setState({ otherError: error });
			});
	}
	render() {
		return (
			<div className="rootContainer">
				<table className="homologyTable">
					<thead>
						<tr>
							<th colSpan="4" className="header">
								Bi-directional Best Hit
							</th>
						</tr>
						<tr>
							<th>Organism</th>
							<th>Primary Identifier</th>
							<th>Symbol</th>
							<th>&nbsp;&nbsp;</th>
						</tr>
					</thead>
					{this.state.bdbhError ? (
						<NoDataTableBody message={this.state.bdbhError} />
					) : (
						<BestHitTableBody
							data={this.state.bidirectionalBestHit}
							navigate={this.props.navigate}
						/>
					)}
					<thead>
						<tr>
							<th colSpan="4" style={{ backgroundColor: '#FFF' }}>
								&nbsp;
							</th>
						</tr>
						<tr>
							<th colSpan="4" className="header">
								Other homology annotations
							</th>
						</tr>
						<tr>
							<th>Organism</th>
							<th>Primary Identifier</th>
							<th>Symbol</th>
							<th>Source</th>
						</tr>
					</thead>
					{this.state.otherError ? (
						<NoDataTableBody message={this.state.otherError} />
					) : (
						<HomolgyTableBody
							data={this.state.otherHomology}
							navigate={this.props.navigate}
						/>
					)}
				</table>
				<FootNote data={this.state.dataSets} navigate={this.props.navigate} />
			</div>
		);
	}
}

export default RootContainer;
