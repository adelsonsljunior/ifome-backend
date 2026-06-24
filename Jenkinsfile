pipeline {
  agent any

  environment {
    DEPLOY_HOST = 'root@localhost'
    DEPLOY_DIR  = '~/deploy/ifome-backend'
  }

  stages {
    stage('Copy files for deploy') {
      steps {
        sshagent(['vps-root-ssh-key']) {
          withCredentials([file(credentialsId: 'ifome-envs', variable: 'ENV_FILE')]) {
            sh '''
              ssh -o StrictHostKeyChecking=no "$DEPLOY_HOST" "mkdir -p $DEPLOY_DIR"

              # Envia o contexto de build pro host (sem .git/.env*).
              # A imagem é construída lá, então o Dockerfile + fontes precisam ir junto.
              tar czf - --exclude=.git --exclude='.env*' . \
                | ssh -o StrictHostKeyChecking=no "$DEPLOY_HOST" "tar xzf - -C $DEPLOY_DIR"

              # Escreve o .env de produção a partir da credencial secret file.
              scp -o StrictHostKeyChecking=no "$ENV_FILE" "$DEPLOY_HOST:$DEPLOY_DIR/.env"
              ssh -o StrictHostKeyChecking=no "$DEPLOY_HOST" "chmod 600 $DEPLOY_DIR/.env"
            '''
          }
        }
      }
    }

    stage('Deploy with Docker Compose') {
      steps {
        sshagent(['vps-root-ssh-key']) {
          sh '''
            ssh -o StrictHostKeyChecking=no "$DEPLOY_HOST" \
              "cd $DEPLOY_DIR && \
               docker compose -f docker-compose.prod.yml up -d --build --remove-orphans && \
               docker image prune -f"
          '''
        }
      }
    }
  }

  post {
    always {
      cleanWs()
    }
    success {
      echo 'Deploy concluído -> https://ifome.juniorslab.online/api/docs'
    }
    failure {
      echo 'Pipeline falhou. Verifique os logs do estágio.'
    }
  }
}
