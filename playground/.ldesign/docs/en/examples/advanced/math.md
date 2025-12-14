# Math Equations

LDoc supports LaTeX math equations using KaTeX.

## Inline Math

Write inline math using single dollar signs: `$E = mc^2$`

The famous equation $E = mc^2$ describes mass-energy equivalence.

The quadratic formula is $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$.

## Block Math

Use double dollar signs for block equations:

$$
\frac{n!}{k!(n-k)!} = \binom{n}{k}
$$

## Common Examples

### Fractions

$$
\frac{a}{b} + \frac{c}{d} = \frac{ad + bc}{bd}
$$

### Square Roots

$$
\sqrt{x^2 + y^2}
$$

$$
\sqrt[3]{8} = 2
$$

### Summation

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

### Integrals

$$
\int_{a}^{b} f(x) \, dx
$$

$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

### Limits

$$
\lim_{x \to \infty} \frac{1}{x} = 0
$$

### Matrices

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
\begin{pmatrix}
x \\
y
\end{pmatrix}
=
\begin{pmatrix}
ax + by \\
cx + dy
\end{pmatrix}
$$

### Greek Letters

$$
\alpha, \beta, \gamma, \delta, \epsilon, \theta, \lambda, \mu, \pi, \sigma, \omega
$$

### Trigonometry

$$
\sin^2\theta + \cos^2\theta = 1
$$

$$
e^{i\pi} + 1 = 0
$$

### Calculus

The derivative of $f(x) = x^n$ is:

$$
\frac{d}{dx} x^n = nx^{n-1}
$$

### Set Notation

$$
A \cup B, \quad A \cap B, \quad A \subseteq B, \quad x \in A
$$

### Logic

$$
\forall x \in \mathbb{R}, \quad \exists y > 0, \quad p \implies q
$$
