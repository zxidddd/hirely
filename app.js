const input = document.querySelector('#fileInput');
const zone = document.querySelector('#dropzone');
const browse = document.querySelector('#browseBtn');
const analyze = document.querySelector('#analyzeBtn');
const toast = document.querySelector('#toast');
const text = document.querySelector('#jobDescription');

function notify(message) { toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); }
function selected(file) { if (!file) return; zone.querySelector('strong').textContent = file.name; zone.querySelector('span').textContent = 'Ready for AI analysis'; zone.classList.add('selected'); notify('Resume added — now add a job description for the sharpest insights.'); }
browse.addEventListener('click', e => { e.stopPropagation(); input.click(); });
zone.addEventListener('click', () => input.click());
input.addEventListener('change', () => selected(input.files[0]));
zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = '#b9ef63'; });
zone.addEventListener('dragleave', () => zone.style.borderColor = '');
zone.addEventListener('drop', e => { e.preventDefault(); zone.style.borderColor = ''; selected(e.dataTransfer.files[0]); });
analyze.addEventListener('click', () => { if (!input.files[0]) { notify('Add a resume first to start your AI review.'); return; } analyze.innerHTML = 'Analyzing your fit…'; analyze.disabled = true; setTimeout(() => { analyze.innerHTML = 'Analysis complete ✓'; notify(text.value.trim() ? 'Your tailored role-match report is ready.' : 'Your resume intelligence report is ready.'); }, 1100); });
