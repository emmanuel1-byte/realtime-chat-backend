export function setCookie(res, refreshToken) {
  res.clearCookie(refreshToken);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + 62 * 24 * 60 * 60 * 1000),
  });
}
