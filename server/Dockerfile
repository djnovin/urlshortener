# Stage 1: Build the app
FROM public.ecr.aws/lambda/nodejs:22 AS builder

WORKDIR /usr/src/app

# Copy only necessary files for dependency installation
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy the rest of the source code and build the app
COPY . .
RUN pnpm run build

# Stage 2: Create the final image for AWS Lambda
FROM public.ecr.aws/lambda/nodejs:22

WORKDIR ${LAMBDA_TASK_ROOT}

# Copy built files and dependencies from the builder stage
COPY --from=builder /usr/src/app/dist/ ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json

CMD ["lambda.handler"]
