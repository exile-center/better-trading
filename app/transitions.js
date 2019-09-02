export default function() {
  this.transition(
    this.fromRoute('home'),
    this.toRoute('settings'),
    this.use('toLeft'),
    this.reverse('toRight')
  );
}
