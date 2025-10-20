<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <h3 class="card-title mb-0">
                <i class="bi bi-house-door-fill me-2"></i>
                Home — Provisória
              </h3>
              <small class="text-muted">Implementação provisória</small>
            </div>

            <p class="mb-3">
              Esta página é uma implementação <strong>provisória</strong> com
              informações básicas.
            </p>

            <div class="row g-3">
              <div class="col-sm-6">
                <div class="border rounded p-3 h-100">
                  <h6 class="mb-2">Horário atual</h6>
                  <div class="d-flex align-items-center gap-3">
                    <i class="bi bi-clock-history fs-2"></i>
                    <div>
                      <div class="fw-bold fs-5">{{ time }}</div>
                      <div class="text-muted small">
                        Timezone: {{ timezone }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-sm-6">
                <div class="border rounded p-3 h-100">
                  <h6 class="mb-2">Informações do sistema</h6>
                  <ul class="list-unstyled mb-0 small">
                    <li>
                      <i class="bi bi-info-circle me-2"></i> Versão da página:
                      <strong>v0.1-provisoria</strong>
                    </li>
                    <li>
                      <i class="bi bi-check2-circle me-2"></i> Status:
                      <span class="badge bg-warning text-dark">Provisório</span>
                    </li>
                    <li>
                      <i class="bi bi-wrench me-2"></i> Descrição: layout
                      minimal para demonstração
                    </li>
                  </ul>
                </div>
              </div>

              <div class="col-12">
                <div class="alert alert-info mb-0" role="alert">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  <strong>Atenção:</strong> esta é uma página provisória.
                  Algumas funcionalidades podem estar faltando ou serem apenas
                  demonstrações.
                </div>
              </div>
            </div>
          </div>
          <div
            class="card-footer text-muted small d-flex justify-content-between"
          >
            <div>Última atualização: {{ lastUpdated }}</div>
            <div>© Internum — 1º RI de Cascavel/PR</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'

  const now = ref(new Date())
  const time = ref(formatTime(now.value))
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'local'
  const lastUpdated = ref(formatFull(now.value))

  let timer = null

  function pad(n) {
    return String(n).padStart(2, '0')
  }

  function formatTime(d) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }

  function formatFull(d) {
    return d.toLocaleString()
  }

  onMounted(() => {
    timer = setInterval(() => {
      now.value = new Date()
      time.value = formatTime(now.value)
    }, 1000)
  })

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  lastUpdated.value = formatFull(new Date())
</script>

<style scoped>
  .card-title i {
    color: #0d6efd;
  }
</style>
