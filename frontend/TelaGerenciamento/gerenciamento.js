function mostrarAba(nomeAba, evento) {
  document.querySelectorAll('.aba-conteudo').forEach(aba => aba.classList.remove('active'));
  document.querySelectorAll('.aba-link').forEach(link => link.classList.remove('active'));

  document.getElementById(`aba-${nomeAba}`).classList.add('active');
  if (evento) evento.currentTarget.classList.add('active');
}
