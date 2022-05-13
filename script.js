const height = 700;
const width = 1200;
const padding = 60;

async function main() {
  const data = await getData();
  const svg = createSvg();

  const domain = Array.from(new Set(data.children.map(d => d.name)));
  const range = domain.map(d => generateHexColorFromDomain(d));
  const color = d3.scaleOrdinal().domain(domain).range(range);

  createTreemap(svg, data, color);

  const legendData = createLegendData(domain, range);
  createLegend(legendData);
}

async function getData() {
  const url = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json';
  return await fetch(url).then(x => x.json());
}

function createSvg() {
  return d3.select('body').append('svg').attr('height', height).attr('width', width);
}

function createTreemap(svg, data, color) {
  const tooltip = createTooltip();
  const root = d3.hierarchy(data).sum(d => d.value);
  d3.treemap().size([width, height]).padding(2)(root);

  svg
    .selectAll('rect')
    .data(root.leaves())
    .enter()
    .append('rect')
    .attr('class', 'tile')
    .attr('data-name', d => d.data.name)
    .attr('data-category', d => d.data.category)
    .attr('data-value', d => d.data.value)
    .attr('x', d => d.x0)
    .attr('y', d => d.y0)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('stroke', 'black')
    .style('fill', d => color(d.parent.data.name))
    .on('mouseenter', (evt, d) => {
      const { x, y } = evt;
      tooltip
        .style('opacity', 1)
        .style('top', `${y - 12}px`)
        .style('left', `${x + 12}px`)
        .attr('data-value', d.data.value).text(`
          Name: ${d.data.name}
          Category: ${d.data.category}
          Value: ${d.data.value}
        `);
    })
    .on('mouseleave', () => {
      tooltip.style('opacity', 0);
    });

  svg
    .selectAll('text')
    .data(root.leaves())
    .enter()
    .append('text')
    .attr('x', d => d.x0 + 5)
    .attr('y', d => d.y0 + 15)
    .text(d => d.data.name)
    .attr('font-size', '11px')
    .attr('fill', 'white');
}

function createTooltip() {
  return d3.select('body').append('div').attr('id', 'tooltip').style('position', 'fixed').style('opacity', 0);
}

function generateHexColorFromDomain(domain) {
  const asciiSum = domain
    .split('')
    .map(x => x.charCodeAt(0))
    .reduce((a, b) => a + b);
  const seed = Number(`0.${asciiSum}`);
  return `#${Math.floor(seed * 16777215).toString(16)}`;
}

function createLegend(data) {
  const padding = 16;
  const spacing = 16;
  const height = padding * 2 + data.length * spacing;

  const legend = d3.select('body').append('svg').attr('id', 'legend').attr('height', height);

  legend
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'legend-item')
    .attr('x', padding)
    .attr('y', (_, i) => padding + i * spacing)
    .attr('height', 7)
    .attr('width', 7)
    .attr('fill', d => d.color);

  legend
    .selectAll('text')
    .data(data)
    .enter()
    .append('text')
    .attr('x', padding + 12)
    .attr('y', (_, i) => padding + 9 + i * spacing)
    .attr('fill', 'black')
    .text(d => d.category);
}

function createLegendData(domain, range) {
  const len = Math.min(domain.length, range.length);
  const data = [];

  for (let i = 0; i < len; i++) {
    const category = domain[i];
    const color = range[i];
    data.push({ category, color });
  }

  return data;
}

main();
