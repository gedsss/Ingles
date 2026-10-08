import Icon from './Icon';

export default function Stars({ n }) {
  return (
    <div className="node-stars">
      {[1, 2, 3].map((k) => <i key={k} className={k <= n ? 'on' : ''}><Icon name="star" /></i>)}
    </div>
  );
}
